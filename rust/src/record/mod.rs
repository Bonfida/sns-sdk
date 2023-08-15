use crate::{
    derivation::{derive, get_prefix, trim_tld, Domain, ROOT_DOMAIN_ACCOUNT},
    error::SnsError,
};

use {bech32::u5, solana_program::pubkey::Pubkey};
pub mod record_v1;
pub mod record_v2;

#[derive(Copy, Clone, Debug)]
pub enum Record {
    Ipfs,
    Arwv,
    Sol,
    Eth,
    Btc,
    Ltc,
    Doge,
    Email,
    Url,
    Discord,
    Github,
    Reddit,
    Twitter,
    Telegram,
    Pic,
    Shdw,
    Point,
    Bsc,
    Injective,
    Backpack,
    A,
    AAAA,
    CNAME,
    TXT,
}

#[derive(Copy, Clone, Debug)]
pub enum RecordVersion {
    V1 = 1,
    V2 = 2,
}

impl Record {
    pub fn as_str(&self) -> &'static str {
        match self {
            Record::Ipfs => "IPFS",
            Record::Arwv => "ARWV",
            Record::Sol => "SOL",
            Record::Eth => "ETH",
            Record::Btc => "BTC",
            Record::Ltc => "LTC",
            Record::Doge => "DOGE",
            Record::Email => "email",
            Record::Url => "url",
            Record::Discord => "discord",
            Record::Github => "github",
            Record::Reddit => "reddit",
            Record::Twitter => "twitter",
            Record::Telegram => "telegram",
            Record::Pic => "pic",
            Record::Shdw => "SHDW",
            Record::Point => "POINT",
            Record::Bsc => "BSC",
            Record::Injective => "INJ",
            Record::Backpack => "backpack",
            Record::A => "A",
            Record::AAAA => "AAAA",
            Record::CNAME => "CNAME",
            Record::TXT => "TXT",
        }
    }

    pub fn try_from_str(input: &str) -> Result<Record, SnsError> {
        match input {
            "IPFS" => Ok(Record::Ipfs),
            "ARWV" => Ok(Record::Arwv),
            "SOL" => Ok(Record::Sol),
            "ETH" => Ok(Record::Eth),
            "BTC" => Ok(Record::Btc),
            "LTC" => Ok(Record::Ltc),
            "DOGE" => Ok(Record::Doge),
            "email" => Ok(Record::Email),
            "url" => Ok(Record::Url),
            "discord" => Ok(Record::Discord),
            "github" => Ok(Record::Github),
            "reddit" => Ok(Record::Reddit),
            "twitter" => Ok(Record::Twitter),
            "telegram" => Ok(Record::Telegram),
            "pic" => Ok(Record::Pic),
            "SHDW" => Ok(Record::Shdw),
            "POINT" => Ok(Record::Point),
            "BSC" => Ok(Record::Bsc),
            "INJ" => Ok(Record::Injective),
            "backpack" => Ok(Record::Backpack),
            "A" => Ok(Record::A),
            "AAAA" => Ok(Record::AAAA),
            "CNAME" => Ok(Record::CNAME),
            "TXT" => Ok(Record::TXT),
            _ => Err(SnsError::UnrecognizedRecord),
        }
    }

    pub fn utf8_encoded(&self) -> bool {
        matches!(
            self,
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
                | Record::CNAME
        )
    }
}

pub fn get_record_key(
    domain: &str,
    record: Record,
    record_version: RecordVersion,
) -> Result<Pubkey, SnsError> {
    let domain = trim_tld(domain);
    let splitted = domain.split('.').collect::<Vec<_>>();
    match splitted.len() {
        1 => {
            let parent = derive(domain, &ROOT_DOMAIN_ACCOUNT);
            let prefix = get_prefix(Domain::Record(record_version));
            let key = derive(&format!("{}{}", prefix, record.as_str()), &parent);
            Ok(key)
        }
        2 => {
            let parent = derive(splitted[1], &ROOT_DOMAIN_ACCOUNT);
            let sub_domain = get_prefix(Domain::Sub) + splitted[1];
            let sub_key = derive(&sub_domain, &parent);

            let record_prefix = get_prefix(Domain::Record(record_version));
            let key = derive(&format!("{record_prefix}{}", record.as_str()), &sub_key);
            Ok(key)
        }
        _ => Err(SnsError::InvalidDomain),
    }
}

pub fn convert_u5_array(u5_data: &[u5]) -> Vec<u8> {
    let mut u8_data: Vec<u8> = Vec::new();
    let mut buffer: u16 = 0;
    let mut buffer_length: u8 = 0;
    for u5 in u5_data {
        buffer = (buffer << 5) | (u5.to_u8() as u16);
        buffer_length += 5;
        while buffer_length >= 8 {
            u8_data.push((buffer >> (buffer_length - 8)) as u8);
            buffer_length -= 8;
        }
    }
    // Make sure there's no remaining data in the buffer
    if buffer_length > 0 {
        u8_data.push((buffer << (8 - buffer_length)) as u8);
    }
    u8_data
}

#[cfg(test)]
mod test {
    use super::*;
    use solana_sdk::pubkey;

    #[test]
    fn test_get_record_key() {
        let v1 = pubkey!("3RfzNCvEqEKZeohqVN16Z1oi6rw5TrANwqAo4hMx6njv");
        let v2 = pubkey!("5vaMyshvmnpmmfzrqYCazUcBrMr6bVw9dqJoRAvzpkdm");
        let domain = "something.sol";
        assert_eq!(
            get_record_key(domain, Record::CNAME, RecordVersion::V1).unwrap(),
            v1
        );
        assert_eq!(
            get_record_key(domain, Record::CNAME, RecordVersion::V2).unwrap(),
            v2
        );
    }
}
