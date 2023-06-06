use {
    derive_more::{Display, Error},
    ed25519_dalek::ed25519,
    solana_client::client_error::ClientError,
    solana_program::program_error::ProgramError,
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
