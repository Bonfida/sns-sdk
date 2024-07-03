#[cfg(not(feature = "devnet"))]
pub type DefaultCluster = Mainnet;

#[cfg(feature = "devnet")]
pub type DefaultCluster = Devnet;

pub struct Mainnet;
pub struct Devnet;

#[cfg(feature = "cluster-generics")]
pub use sealed::Cluster;

mod sealed {
    use crate::{Devnet, Mainnet};

    pub trait Cluster {
        const ID: usize;
    }

    impl Cluster for Mainnet {
        const ID: usize = 0;
    }
    impl Cluster for Devnet {
        const ID: usize = 1;
    }
}

macro_rules! cluster_constants {
    {mod $i0:ident; mainnet { $(pub const $i_mainnet:ident: $t_mainnet:ty = $e_mainnet:expr);* ;} devnet { $(pub const $i_devnet:ident: $t_devnet:ty = $e_devnet:expr);* ;}} => {
        paste::paste! {
            #[cfg(all(feature = "devnet", not(feature = "cluster-generics")))]
            pub use [<$i0 _devnet>]::*;

            #[cfg(all(not(feature = "devnet"), not(feature = "cluster-generics")))]
            pub use [<$i0 _mainnet>]::*;

            #[cfg(feature = "cluster-generics")]
            pub use $i0::*;

            #[cfg(any(feature = "cluster-generics", not(feature="devnet")))]
            pub mod [<$i0 _mainnet>] {
                use super::*;
                $(pub const $i_mainnet: $t_mainnet = $e_mainnet);* ;
            }

            #[cfg(any(feature = "cluster-generics", feature="devnet"))]
            pub mod [<$i0 _devnet>] {
                use super::*;
                $(pub const $i_devnet: $t_devnet = $e_devnet);* ;
            }
            #[cfg(feature = "cluster-generics")]
            pub mod $i0 {
                use super::*;
                $(pub const $i_mainnet: [$t_mainnet;2] = [[<$i0 _mainnet>]::$i_mainnet, [<$i0 _devnet>]::$i_mainnet]);* ;
            }
        }
    };
}
