use borsh::BorshDeserialize;
use sns_records::state::{
    record_header::RecordHeader,
    validation::{get_validation_length, Validation},
};
use solana_program::{program_pack::Pack, pubkey};

use super::{convert_u5_array, get_record_key, Record};
use crate::{
    error::SnsError,
    non_blocking::resolve::{resolve_name_registry, resolve_name_registry_batch},
};
use {
    bech32::ToBase32,
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_program::pubkey::Pubkey,
    spl_name_service::state::NameRecordHeader,
    std::net::{Ipv4Addr, Ipv6Addr},
    std::str::FromStr,
};

pub struct ParsedRecord<'a> {
    pub kind: Record,
    pub header: RecordHeader,
    pub roa_id: &'a [u8],
    pub staleness_id: &'a [u8],
    pub content: String,
}

pub const GUARDIAN_ID: Pubkey = pubkey!("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3");

impl<'a> ParsedRecord<'a> {
    pub fn verify_staleness(
        &self,
        domain_owner_key: Pubkey,
        domain_owner_account_data: Option<&[u8]>,
    ) -> Result<(), SnsError> {
        if domain_owner_key == sns_warp_common::constants::EMITTER_KEY {
            // The domain is XChain-owned
            if self.header.staleness_validation != Validation::XChain as u16 {
                return Err(SnsError::StaleRecord);
            }
            let domain_owner_account_data =
                domain_owner_account_data.ok_or(SnsError::StaleRecord)?;
            let xchain_record = sns_warp_common::state::x_domain::XDomain::try_from_slice(
                domain_owner_account_data,
            )?;
            let expected_owner_chain = u16::from_le_bytes(
                self.staleness_id
                    .get(..2)
                    .ok_or(SnsError::InvalidRecordData)?
                    .try_into()
                    .unwrap(),
            );
            let expected_owner_address = self
                .staleness_id
                .get(2..)
                .ok_or(SnsError::InvalidRecordData)?;
            if expected_owner_chain != xchain_record.owner_chain
                || expected_owner_address != xchain_record.owner_address
            {
                return Err(SnsError::StaleRecord);
            }
        }
        if self.header.staleness_validation != Validation::Solana as u16
            || self.staleness_id != domain_owner_key.as_ref()
        {
            return Err(SnsError::StaleRecord);
        }
        Ok(())
    }

    pub fn verify_roa(&self) -> Result<(), SnsError> {
        let validation = self.kind.roa_validation();
        if validation as u16 != self.header.right_of_association_validation {
            return Err(SnsError::UnverifiedRecord);
        }
        if matches!(self.kind, Record::CNAME | Record::Url) && self.roa_id != GUARDIAN_ID.as_ref() {
            return Err(SnsError::UnverifiedRecord);
        }
        Ok(())
    }
}

pub async fn parse_record_v2(
    record: Record,
    account_data: &[u8],
) -> Result<ParsedRecord, SnsError> {
    let record_header = RecordHeader::from_buffer(account_data);
    let mut offset = spl_name_service::state::NameRecordHeader::LEN + RecordHeader::LEN;
    let roa_validation = Validation::try_from(record_header.right_of_association_validation)?;
    let staleness_validation = Validation::try_from(record_header.staleness_validation)?;
    let mut length = get_validation_length(roa_validation) as usize;
    let roa_id = account_data
        .get(offset..offset + length)
        .ok_or(SnsError::InvalidRecordData)?;
    offset += length;
    length = get_validation_length(staleness_validation) as usize;
    let staleness_id = account_data
        .get(offset..offset + length)
        .ok_or(SnsError::InvalidRecordData)?;
    offset += length;
    let content = deserialize_record_v2_content(
        account_data
            .get(offset..)
            .ok_or(SnsError::InvalidRecordData)?,
        record,
    )?;
    Ok(ParsedRecord {
        kind: record,
        header: record_header,
        roa_id,
        staleness_id,
        content,
    })
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
        Record::Bsc | Record::Eth | Record::BASE => {
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
        Record::Bsc | Record::Eth | Record::BASE => {
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

#[cfg(test)]
mod test {

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
}
