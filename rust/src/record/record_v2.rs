use std::str::FromStr;

use super::{convert_u5_array, Record};
use crate::error::SnsError;
use {
    bech32::ToBase32,
    bonfida_utils::WrappedPodMut,
    bytemuck::{Pod, Zeroable},
    solana_program::pubkey::Pubkey,
    std::net::{Ipv4Addr, Ipv6Addr},
};

#[derive(Clone, Copy)]
#[repr(u16)]
pub enum GuardianSig {
    None,
    Solana,
    Ethereum,
    Injective,
}

#[derive(Clone, Copy)]
#[repr(u16)]
pub enum UserSig {
    None,
    Solana,
}

#[derive(Clone, Copy)]
pub enum Signature {
    User(UserSig),
    Guardian(GuardianSig),
}

#[derive(Clone, Copy, Zeroable, Pod)]
#[repr(C)]
pub struct RecordV2Header {
    pub user_signature: u16,
    pub guardian_signature: u16,
    pub content_length: u32,
}

impl RecordV2Header {
    pub const LEN: usize = std::mem::size_of::<RecordV2Header>();
}

#[derive(WrappedPodMut)]
pub struct RecordV2<'a> {
    pub header: &'a mut RecordV2Header,
    pub buffer: &'a mut [u8],
}

impl<'a> RecordV2<'a> {
    pub fn from_buffer(buffer: &'a mut [u8]) -> Result<Self, SnsError> {
        let (hd, buf) = buffer.split_at_mut(RecordV2Header::LEN);
        let header = bytemuck::try_from_bytes_mut::<RecordV2Header>(hd)?;
        Ok(Self {
            header,
            buffer: buf,
        })
    }
}

pub fn get_signature_byte_length(signature_type: Signature) -> Result<usize, SnsError> {
    match signature_type {
        Signature::Guardian(guardian) => match guardian {
            GuardianSig::None => Ok(0),
            GuardianSig::Solana => Ok(64),
            GuardianSig::Ethereum => Ok(65),
            GuardianSig::Injective => Ok(65),
        },
        Signature::User(user) => match user {
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

pub fn get_message_to_sign() {}
