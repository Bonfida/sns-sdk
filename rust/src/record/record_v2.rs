use super::{convert_u5_array, get_record_key, Record};
use crate::{
    error::SnsError,
    non_blocking::resolve::{resolve_name_registry, resolve_name_registry_batch},
};
use {
    bech32::ToBase32,
    bonfida_utils::WrappedPodMut,
    bytemuck::{Pod, Zeroable},
    num_derive::FromPrimitive,
    num_traits::FromPrimitive,
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_program::pubkey::Pubkey,
    spl_name_service::state::NameRecordHeader,
    std::net::{Ipv4Addr, Ipv6Addr},
    std::str::FromStr,
};

#[derive(Clone, Copy, Debug, FromPrimitive)]
#[repr(u16)]
pub enum GuardianSig {
    None,
    Solana,
    Ethereum,
    Injective,
}

#[derive(Clone, Copy, Debug, FromPrimitive)]
#[repr(u16)]
pub enum UserSig {
    None,
    Solana,
}

#[derive(Clone, Copy)]
pub enum SignatureType {
    User(UserSig),
    Guardian(GuardianSig),
}

impl From<SignatureType> for u16 {
    fn from(sig_type: SignatureType) -> u16 {
        match sig_type {
            SignatureType::User(user_sig) => user_sig as u16,
            SignatureType::Guardian(guardian_sig) => guardian_sig as u16,
        }
    }
}

pub struct Signatrue<'a> {
    pub sig_type: SignatureType,
    pub signature: &'a [u8],
}

#[derive(Clone, Copy, Zeroable, Pod, Debug)]
#[repr(C)]
pub struct RecordV2Header {
    pub user_signature: u16,
    pub guardian_signature: u16,
    pub content_length: u32,
}

impl RecordV2Header {
    pub const LEN: usize = std::mem::size_of::<RecordV2Header>();
}

#[derive(WrappedPodMut, Debug)]
pub struct RecordV2Ref<'a> {
    pub header: &'a mut RecordV2Header,
    pub buffer: &'a mut [u8],
}

impl<'a> RecordV2Ref<'a> {
    pub fn from_buffer(buffer: &'a mut [u8]) -> Result<Self, SnsError> {
        let (hd, buf) = buffer.split_at_mut(RecordV2Header::LEN);
        let header = bytemuck::try_from_bytes_mut::<RecordV2Header>(hd)?;
        Ok(Self {
            header,
            buffer: buf,
        })
    }

    pub fn get_content(&self) -> Result<&[u8], SnsError> {
        let g_sig: SignatureType = SignatureType::Guardian(
            GuardianSig::from_u16(self.header.guardian_signature).ok_or(SnsError::Casting)?,
        );
        let u_sig = SignatureType::User(
            UserSig::from_u16(self.header.user_signature).ok_or(SnsError::Casting)?,
        );
        let offset = get_signature_byte_length(g_sig)? + get_signature_byte_length(u_sig)?;
        let content = &self
            .buffer
            .get(offset..offset + self.header.content_length as usize);
        if let Some(content) = content {
            Ok(content)
        } else {
            Err(SnsError::InvalidRecordData)
        }
    }

    pub fn deserialize(&self, record: Record) -> Result<String, SnsError> {
        deserialize_record_v2_content(self.get_content()?, record)
    }

    pub fn serialize(&mut self) -> Result<Vec<u8>, SnsError> {
        let header_bytes =
            bytemuck::cast_mut::<RecordV2Header, [u8; RecordV2Header::LEN]>(self.header);
        let mut res = Vec::with_capacity(RecordV2Header::LEN + self.buffer.len());
        res.extend_from_slice(header_bytes);
        res.extend_from_slice(self.buffer);
        Ok(res)
    }
}

pub async fn retrieve_record_v2(
    rpc_client: RpcClient,
    record: Record,
    domain: &str,
) -> Result<Option<(NameRecordHeader, Vec<u8>)>, SnsError> {
    let record_key = get_record_key(domain, record, super::RecordVersion::V2)?;
    resolve_name_registry(&rpc_client, &record_key).await
}

pub async fn retrieve_records_batch_v2(
    rpc_client: RpcClient,
    records: &[Record],
    domain: &str,
) -> Result<Vec<Option<(NameRecordHeader, Vec<u8>)>>, SnsError> {
    let pubkeys: Vec<Pubkey> = records
        .iter()
        .map(|r| get_record_key(domain, *r, super::RecordVersion::V2))
        .collect::<Result<Vec<_>, _>>()?;
    resolve_name_registry_batch(&rpc_client, &pubkeys).await
}

pub fn verify_solana_signature(
    message: &[u8],
    signature: &[u8],
    public_key: &[u8],
) -> Result<bool, SnsError> {
    let key = ed25519_dalek::PublicKey::from_bytes(public_key)?;
    let sig = ed25519_dalek::Signature::from_bytes(signature)?;
    let res = key.verify_strict(message, &sig).is_ok();
    Ok(res)
}

pub fn get_signature_byte_length(signature_type: SignatureType) -> Result<usize, SnsError> {
    match signature_type {
        SignatureType::Guardian(guardian) => match guardian {
            GuardianSig::None => Ok(0),
            GuardianSig::Solana => Ok(64),
            GuardianSig::Ethereum => Ok(65),
            GuardianSig::Injective => Ok(65),
        },
        SignatureType::User(user) => match user {
            UserSig::None => Ok(0),
            UserSig::Solana => Ok(64),
        },
    }
}

pub fn deserialize_record_v2_content(content: &[u8], record: Record) -> Result<String, SnsError> {
    match record {
        // UTF-8 encoded record
        Record::Ipfs
        | Record::Arwv
        | Record::Ltc
        | Record::Doge
        | Record::Email
        | Record::Url
        | Record::Discord
        | Record::Github
        | Record::Reddit
        | Record::Twitter
        | Record::Telegram
        | Record::Pic
        | Record::Shdw
        | Record::Point
        | Record::Backpack
        | Record::TXT
        | Record::Btc
        | Record::CNAME => {
            let decoded = String::from_utf8(content.to_vec())?;
            if matches!(record, Record::CNAME | Record::TXT) {
                let decoded = punycode::decode(&decoded).map_err(|_| SnsError::Punycode)?;
                Ok(decoded)
            } else {
                Ok(decoded)
            }
        }
        Record::Sol => {
            let bytes: [u8; 32] = content.try_into()?;
            let pubkey = Pubkey::new_from_array(bytes);
            Ok(pubkey.to_string())
        }
        Record::Injective => {
            let des = bech32::encode("inj", content.to_base32(), bech32::Variant::Bech32)?;
            Ok(des)
        }
        Record::Bsc | Record::Eth => {
            let des = format!("0x{}", hex::encode(content));
            Ok(des)
        }
        Record::AAAA => {
            let bytes: [u8; 16] = content.try_into()?;
            let ip = Ipv6Addr::from(bytes);
            Ok(ip.to_string())
        }
        Record::A => {
            let bytes: [u8; 4] = content.try_into()?;
            let ip = Ipv4Addr::from(bytes);
            Ok(ip.to_string())
        }
    }
}

pub fn serialize_record_v2_content(content: &str, record: Record) -> Result<Vec<u8>, SnsError> {
    match record {
        // UTF-8 encoded record
        Record::Ipfs
        | Record::Arwv
        | Record::Ltc
        | Record::Doge
        | Record::Email
        | Record::Url
        | Record::Discord
        | Record::Github
        | Record::Reddit
        | Record::Twitter
        | Record::Telegram
        | Record::Pic
        | Record::Shdw
        | Record::Point
        | Record::Backpack
        | Record::TXT
        | Record::Btc
        | Record::CNAME => {
            if matches!(record, Record::CNAME | Record::TXT) {
                let encoded = punycode::encode(content).map_err(|_| SnsError::Punycode)?;
                Ok(encoded.as_bytes().to_vec())
            } else {
                Ok(content.as_bytes().to_vec())
            }
        }
        Record::Sol => {
            let pubkey = Pubkey::from_str(content).map_err(|_| SnsError::InvalidPubkey)?;
            Ok(pubkey.to_bytes().to_vec())
        }
        Record::Injective => {
            if !content.starts_with("inj") {
                return Err(SnsError::InvalidInjectiveAddress);
            }
            let (_, data, _) = bech32::decode(content)?;
            let data = convert_u5_array(&data);
            if data.len() != 20 {
                return Err(SnsError::InvalidInjectiveAddress);
            }
            Ok(data)
        }
        Record::Bsc | Record::Eth => {
            if !content.starts_with("0x") {
                return Err(SnsError::InvalidEvmAddress);
            }
            let decoded = hex::decode(content.get(2..).ok_or(SnsError::InvalidEvmAddress)?)?;
            if decoded.len() != 20 {
                return Err(SnsError::InvalidEvmAddress);
            }
            Ok(decoded)
        }
        Record::AAAA => {
            let ip = content
                .parse::<Ipv6Addr>()
                .map_err(|_| SnsError::InvalidIpv6)?;
            Ok(ip.octets().to_vec())
        }
        Record::A => {
            let ip = content
                .parse::<Ipv4Addr>()
                .map_err(|_| SnsError::InvalidIpv4)?;
            Ok(ip.octets().to_vec())
        }
    }
}

pub fn get_message_to_sign(
    content: &str,
    domain: &str,
    record: Record,
) -> Result<Vec<u8>, SnsError> {
    let buffer = serialize_record_v2_content(content, record)?;
    let record_key = get_record_key(domain, record, super::RecordVersion::V2)?;
    let res = [record_key.to_bytes().to_vec(), buffer].concat();
    Ok(hex::encode(res).as_bytes().to_vec())
}

#[cfg(test)]
mod test {
    use dotenv::dotenv;
    use solana_sdk::pubkey;

    use super::*;
    #[test]
    fn test_serialize_record_v2_content() {
        let content = "this is a test";
        let buffer = vec![
            116, 104, 105, 115, 32, 105, 115, 32, 97, 32, 116, 101, 115, 116, 45,
        ];
        let ser = serialize_record_v2_content(content, Record::TXT).unwrap();
        assert_eq!(buffer, ser);

        let content = "D8mRVSXrE2uU8KDAKQsGbfBNRyunMrmHBdEMrtWz1cUc";
        let buffer = vec![
            180, 73, 137, 132, 77, 15, 98, 34, 43, 221, 219, 250, 234, 69, 5, 187, 165, 135, 112,
            64, 210, 198, 161, 135, 12, 123, 255, 155, 246, 126, 213, 29,
        ];
        let ser = serialize_record_v2_content(content, Record::Sol).unwrap();
        assert_eq!(buffer, ser)
    }

    #[test]
    fn test_deserialize_record_v2_content() {
        let content = "this is a test";
        let buffer = vec![
            116, 104, 105, 115, 32, 105, 115, 32, 97, 32, 116, 101, 115, 116, 45,
        ];
        let des = deserialize_record_v2_content(&buffer, Record::TXT).unwrap();
        assert_eq!(des, content);

        let content = "D8mRVSXrE2uU8KDAKQsGbfBNRyunMrmHBdEMrtWz1cUc";
        let buffer = vec![
            180, 73, 137, 132, 77, 15, 98, 34, 43, 221, 219, 250, 234, 69, 5, 187, 165, 135, 112,
            64, 210, 198, 161, 135, 12, 123, 255, 155, 246, 126, 213, 29,
        ];
        let des = deserialize_record_v2_content(&buffer, Record::Sol).unwrap();
        assert_eq!(des, content)
    }

    #[test]
    fn test_des_ser() {
        let content = "test";
        let ser = serialize_record_v2_content(content, Record::TXT).unwrap();
        let des = deserialize_record_v2_content(&ser, Record::TXT).unwrap();
        assert_eq!(content, des);

        let content = "192.168.0.0";
        let ser = serialize_record_v2_content(content, Record::A).unwrap();
        let des = deserialize_record_v2_content(&ser, Record::A).unwrap();
        assert_eq!(content, des);
    }

    #[tokio::test]
    async fn test_fetch_record() {
        dotenv().ok();
        let domain = "record-v2";
        let rpc_client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let (_, mut data) = retrieve_record_v2(rpc_client, Record::TXT, domain)
            .await
            .unwrap()
            .unwrap();
        let record_v2 = RecordV2Ref::from_buffer(&mut data).unwrap();
        let des = record_v2.deserialize(Record::TXT).unwrap();
        assert_eq!(des, "test")
    }

    #[tokio::test]
    async fn test_fetch_records_batch() {
        dotenv().ok();
        let domain = "record-v2";
        let rpc_client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let res = retrieve_records_batch_v2(rpc_client, &[Record::TXT, Record::CNAME], domain)
            .await
            .unwrap();
        let (_, mut txt_data) = res[0].as_ref().unwrap().clone();
        let txt = RecordV2Ref::from_buffer(&mut txt_data).unwrap();
        assert_eq!(txt.deserialize(Record::TXT).unwrap(), "test");

        // Process CNAME record
        let (_, mut cname_data) = res[1].as_ref().unwrap().clone();
        let cname = RecordV2Ref::from_buffer(&mut cname_data).unwrap();
        assert_eq!(cname.deserialize(Record::CNAME).unwrap(), "google.com");
    }

    #[tokio::test]
    async fn test_user_signature() {
        dotenv().ok();
        let owner = pubkey!("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");
        let domain = "20220901";
        let msg = get_message_to_sign("test@email.com1", domain, Record::Email).unwrap();
        let rpc_client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let (_, mut data) = retrieve_record_v2(rpc_client, Record::Email, domain)
            .await
            .unwrap()
            .unwrap();
        let r = RecordV2Ref::from_buffer(&mut data).unwrap();
        let sig = r
            .buffer
            .get(0..get_signature_byte_length(SignatureType::User(UserSig::Solana)).unwrap())
            .unwrap();
        let valid = verify_solana_signature(&msg, sig, &owner.to_bytes()).unwrap();
        assert!(valid)
    }
}
