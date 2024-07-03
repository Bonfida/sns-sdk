use solana_program::{pubkey, pubkey::Pubkey};

#[macro_use]
pub(crate) mod cluster_utils;
#[cfg(feature = "cluster-generics")]
pub use cluster_utils::Cluster;
pub use cluster_utils::{DefaultCluster, Devnet, Mainnet};

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

cluster_constants! {
    mod name_offers;
    mainnet {
        pub const NAME_OFFERS_PROGRAM_ID: Pubkey = pubkey!("85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29");
    }
    devnet {
        pub const NAME_OFFERS_PROGRAM_ID: Pubkey = pubkey!("nameaSUMPQLdPzSimWStRKQyuwwiKscgWnZ6FSsT4zn");
    }
}
