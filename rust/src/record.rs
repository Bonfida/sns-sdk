use crate::error::SnsError;

use {ed25519_dalek, solana_program::pubkey::Pubkey};

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
            Record::Injective => "INJECT",
        }
    }
}

pub fn check_sol_record(
    record: &[u8],
    signed_record: &[u8],
    pubkey: Pubkey,
) -> Result<bool, SnsError> {
    let key = ed25519_dalek::PublicKey::from_bytes(&pubkey.to_bytes())?;
    let sig = ed25519_dalek::Signature::from_bytes(signed_record)?;
    let res = key.verify_strict(record, &sig).is_ok();
    Ok(res)
}
