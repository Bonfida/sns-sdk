use {
    solana_client::nonblocking, solana_client::rpc_client, solana_program::program_pack::Pack,
    solana_program::pubkey::Pubkey, spl_name_service::state::get_seeds_and_key,
    spl_name_service::state::NameRecordHeader,
};

use crate::{
    derivation::{get_hashed_name, get_reverse_key, REVERSE_LOOKUP_CLASS},
    error::SnsError,
};

#[cfg(feature = "async")]
pub async fn resolve_owner(rpc_client: nonblocking::rpc_client::RpcClient, domain: &str) -> Pubkey {
    todo!()
}

#[cfg(feature = "async")]
pub async fn resolve_record() {}

#[cfg(feature = "async")]
pub async fn resolve_name_registry<'a>(
    rpc_client: nonblocking::rpc_client::RpcClient,
    key: Pubkey,
) -> Result<(NameRecordHeader, Vec<u8>), SnsError> {
    let acc = rpc_client.get_account(&key).await?;
    let header = NameRecordHeader::unpack(&acc.data[0..NameRecordHeader::LEN])?;
    let mut data = vec![];
    data.copy_from_slice(&acc.data[NameRecordHeader::LEN..]);
    Ok((header, data))
}

#[cfg(feature = "async")]
pub async fn resolve_reverse(
    rpc_client: nonblocking::rpc_client::RpcClient,
    key: Pubkey,
) -> Result<String, SnsError> {
    let hashed = get_hashed_name(&key.to_string());
    let (key, _) = get_seeds_and_key(
        &spl_name_service::ID,
        hashed,
        Some(&REVERSE_LOOKUP_CLASS),
        None,
    );

    let (_, data) = resolve_name_registry(rpc_client, key).await?;
    let len = *bytemuck::from_bytes::<u32>(&data[0..4]);
    let reverse =
        String::from_utf8(data[4..4 + len as usize].to_vec()).or(Err(SnsError::InvalidReverse))?;
    Ok(reverse)
}

#[cfg(feature = "async")]
pub async fn get_domains_owner() {}

#[cfg(feature = "async")]
pub async fn get_subdomains() {}

#[cfg(not(feature = "async"))]
pub fn resolve_name_registry<'a>(
    rpc_client: rpc_client::RpcClient,
    key: Pubkey,
) -> Result<(NameRecordHeader, Vec<u8>), SnsError> {
    let acc = rpc_client.get_account(&key)?;
    let header = NameRecordHeader::unpack(&acc.data[0..NameRecordHeader::LEN])?;
    let mut data = vec![];
    data.copy_from_slice(&acc.data[NameRecordHeader::LEN..]);
    Ok((header, data))
}
