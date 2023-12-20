use solana_program::{pubkey, pubkey::Pubkey};

pub mod derivation;
pub mod error;
pub mod favourite_domain;
pub mod register;
mod utils;

pub mod record;

#[cfg(not(feature = "blocking"))]
pub mod non_blocking;

#[cfg(feature = "blocking")]
pub mod blocking;

#[cfg(not(feature = "devnet"))]
pub const NAME_OFFERS_PROGRAM_ID: Pubkey = pubkey!("85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29");

#[cfg(feature = "devnet")]
pub const NAME_OFFERS_PROGRAM_ID: Pubkey = pubkey!("nameaSUMPQLdPzSimWStRKQyuwwiKscgWnZ6FSsT4zn");
