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
    FavouriteDomain = 4,
}

#[derive(BorshDeserialize)]
pub struct FavouriteDomain {
    pub tag: Tag,
    pub name_account: Pubkey,
}

impl FavouriteDomain {
    pub fn parse(mut buffer: &[u8]) -> Result<FavouriteDomain, std::io::Error> {
        Self::deserialize(&mut buffer)
    }
}
