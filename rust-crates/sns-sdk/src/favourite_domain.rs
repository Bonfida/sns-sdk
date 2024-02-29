use std::io::ErrorKind;

use bonfida_utils::InstructionsAccount;
use borsh::BorshDeserialize;
use solana_program::pubkey::Pubkey;
use solana_sdk::instruction::Instruction;

use crate::NAME_OFFERS_PROGRAM_ID;

pub fn derive_favourite_domain_key(owner: &Pubkey) -> Pubkey {
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

pub mod register_favourite {
    use bonfida_utils::{BorshSize, InstructionsAccount};
    use borsh::{BorshDeserialize, BorshSerialize};
    use solana_sdk::pubkey::Pubkey;

    #[derive(InstructionsAccount)]
    /// The required accounts for the `create` instruction
    pub struct Accounts<'a, T> {
        /// The name account
        #[cons(writable)]
        pub name: &'a T,
        #[cons(writable)]
        pub favourite_domain: &'a T,
        #[cons(writable, signer)]
        pub owner: &'a T,
        pub system_program: &'a T,
    }

    #[derive(BorshDeserialize, BorshSerialize, BorshSize, Clone, Copy)]
    #[cfg_attr(feature = "instruction_params_casting", derive(Zeroable, Pod))]
    #[repr(C)]
    pub struct Params {}
}

pub fn get_register_favourite_instruction(
    program_id: Pubkey,
    accounts: register_favourite::Accounts<Pubkey>,
    params: register_favourite::Params,
) -> Instruction {
    accounts.get_instruction(program_id, 6, params)
}
