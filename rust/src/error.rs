use {
    derive_more::{Display, Error},
    solana_client::client_error::ClientError,
    solana_program::program_error::ProgramError,
    ed25519_dalek::ed25519
};

#[derive(Debug, Display, Error)]
pub enum SnsError {
    #[display(fmt = "")]
    InvalidDomain,
    SolanaClient(ClientError),
    SolanaProgramError(ProgramError),
    InvalidReverse,
    ED25519(ed25519::Error)
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
    fn from(e:ed25519::Error) ->Self {
        Self::ED25519(e)
    }
}