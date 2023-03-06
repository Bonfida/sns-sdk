use {
    solana_client::rpc_client, solana_program::program_pack::Pack, solana_program::pubkey::Pubkey,
    spl_name_service::state::get_seeds_and_key, spl_name_service::state::NameRecordHeader,
};

use crate::{
    derivation::{get_hashed_name, get_reverse_key, REVERSE_LOOKUP_CLASS},
    error::SnsError,
};

pub fn resolve_name_registry<'a>(
    rpc_client: rpc_client::RpcClient,
    key: Pubkey,
) -> Result<(NameRecordHeader, Vec<u8>), SnsError> {
    let acc = rpc_client.get_account(&key)?;
    let header = NameRecordHeader::unpack_unchecked(&acc.data[..NameRecordHeader::LEN])?;
    let data = acc.data[NameRecordHeader::LEN..].to_vec();
    Ok((header, data))
}

pub fn resolve_reverse(rpc_client: rpc_client::RpcClient, key: Pubkey) -> Result<String, SnsError> {
    let hashed = get_hashed_name(&key.to_string());
    let (key, _) = get_seeds_and_key(
        &spl_name_service::ID,
        hashed,
        Some(&REVERSE_LOOKUP_CLASS),
        None,
    );
    let (_, data) = resolve_name_registry(rpc_client, key)?;
    let len = u32::from_le_bytes(data[0..4].try_into().unwrap());
    let reverse =
        String::from_utf8(data[4..4 + len as usize].to_vec()).or(Err(SnsError::InvalidReverse))?;
    Ok(reverse)
}

#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::pubkey;

    #[test]
    fn reverse() {
        let client = rpc_client::RpcClient::new("https://api.mainnet-beta.solana.com/");
        let key: Pubkey = pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");
        let reverse = resolve_reverse(client, key).unwrap();
        assert_eq!(reverse, "bonfida");
    }
}
