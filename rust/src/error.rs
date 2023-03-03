use {
    derive_more::{Display, Error},
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
