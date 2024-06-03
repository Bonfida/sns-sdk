use std::array::TryFromSliceError;

use {
    derive_more::{Display, Error},
    ed25519_dalek::ed25519,
    solana_client::client_error::ClientError,
    solana_program::program_error::ProgramError,
    std::string::FromUtf8Error,
};

#[derive(Debug, Display, Error)]
pub enum SnsError {
    #[display(fmt = "")]
    InvalidDomain,
    SolanaClient(ClientError),
    SolanaProgramError(ProgramError),
    InvalidReverse,
    ED25519(ed25519::Error),
    BorshError(std::io::Error),
    UnsupportedMint,
    SerializationError,
    InvalidPubkey,
    Utf8(FromUtf8Error),
    Bech32(bech32::Error),
    InvalidRecordData,
    Hex(hex::FromHexError),
    UnrecognizedRecord,
    Punycode,
    InvalidEvmAddress,
    InvalidInjectiveAddress,
    InvalidIpv4,
    InvalidIpv6,
    SolRecordNotSupported,
    NftRecordDoesNotExist,
    Casting,
    TryFromSlice(std::array::TryFromSliceError),
    RecordsError(sns_records::error::SnsRecordsError),
    StaleRecord,
    UnverifiedRecord,
}

impl From<ClientError> for SnsError {
    fn from(e: ClientError) -> Self {
        Self::SolanaClient(e)
    }
}

impl From<ProgramError> for SnsError {
    fn from(e: ProgramError) -> Self {
        Self::SolanaProgramError(e)
    }
}

impl From<ed25519::Error> for SnsError {
    fn from(e: ed25519::Error) -> Self {
        Self::ED25519(e)
    }
}

impl From<std::io::Error> for SnsError {
    fn from(value: std::io::Error) -> Self {
        Self::BorshError(value)
    }
}

impl From<FromUtf8Error> for SnsError {
    fn from(e: FromUtf8Error) -> Self {
        Self::Utf8(e)
    }
}

impl From<bech32::Error> for SnsError {
    fn from(e: bech32::Error) -> Self {
        Self::Bech32(e)
    }
}

impl From<hex::FromHexError> for SnsError {
    fn from(e: hex::FromHexError) -> Self {
        Self::Hex(e)
    }
}

impl From<bytemuck::PodCastError> for SnsError {
    fn from(_: bytemuck::PodCastError) -> Self {
        Self::Casting
    }
}

impl From<TryFromSliceError> for SnsError {
    fn from(e: std::array::TryFromSliceError) -> Self {
        Self::TryFromSlice(e)
    }
}

impl From<sns_records::error::SnsRecordsError> for SnsError {
    fn from(value: sns_records::error::SnsRecordsError) -> Self {
        Self::RecordsError(value)
    }
}
