use std::io::ErrorKind;

use borsh::BorshDeserialize;
use solana_program::pubkey::Pubkey;

use crate::NAME_OFFERS_PROGRAM_ID;

pub(crate) fn derive_favorite_domain_key(owner: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[b"favourite_domain", &owner.to_bytes()],
        &NAME_OFFERS_PROGRAM_ID,
    )
    .0
}

#[derive(BorshDeserialize)]
pub enum Tag {
    _A,
    _B,
    _C,
    _D,
    FavouriteDomain = 4,
}

#[derive(BorshDeserialize)]
pub struct FavouriteDomain {
    pub tag: Tag,
    pub name_account: Pubkey,
}

impl FavouriteDomain {
    pub fn parse(mut buffer: &[u8]) -> Result<FavouriteDomain, std::io::Error> {
        let s = Self::deserialize(&mut buffer)?;
        if !matches!(s.tag, Tag::FavouriteDomain) {
            Err(std::io::Error::new(ErrorKind::InvalidData, ""))
        } else {
            Ok(s)
        }
    }
}
