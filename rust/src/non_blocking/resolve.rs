use {
    solana_account_decoder::UiAccountEncoding,
    solana_client::{
        client_error::{ClientError, ClientErrorKind},
        nonblocking::rpc_client::RpcClient,
        rpc_config::{RpcAccountInfoConfig, RpcProgramAccountsConfig},
        rpc_filter::{Memcmp, RpcFilterType},
        rpc_request::RpcError::RpcRequestError,
    },
    solana_program::{program_pack::Pack, pubkey::Pubkey},
    spl_name_service::state::{get_seeds_and_key, NameRecordHeader},
    spl_token::state::Mint,
};

use crate::{
    derivation::{
        get_domain_key, get_domain_mint, get_hashed_name, REVERSE_LOOKUP_CLASS, ROOT_DOMAIN_ACCOUNT,
    },
    error::SnsError,
    record::{check_sol_record, Record},
};

pub async fn resolve_owner(rpc_client: &RpcClient, domain: &str) -> Result<Pubkey, SnsError> {
    let key = get_domain_key(domain, false)?;
    let (header, _) = resolve_name_registry(rpc_client, &key).await?;

    let nft_owner = resolve_nft_owner(rpc_client, &key).await?;

    if let Some(nft_owner) = nft_owner {
        return Ok(nft_owner);
    }

    let sol_record_key = get_domain_key(&format!("SOL.{domain}"), true)?;
    match resolve_name_registry(rpc_client, &sol_record_key).await {
        Ok((_, data)) => {
            let data = &data[..96];
            let record = [&data[..32], &sol_record_key.to_bytes()].concat();
            let sig = &data[32..];
            let encoded = hex::encode(&record);
            if check_sol_record(encoded.as_bytes(), sig, header.owner)? {
                return Ok(Pubkey::new_from_array(data[0..32].try_into().unwrap()));
            }
        }
        Err(SnsError::SolanaClient(ClientError {
            request: None,
            kind: ClientErrorKind::RpcError(RpcRequestError(err)),
        })) => {
            return Err(SnsError::SolanaClient(ClientError {
                request: None,
                kind: ClientErrorKind::RpcError(RpcRequestError(err)),
            }))
        }
        _ => {}
    }

    Ok(header.owner)
}

pub async fn resolve_record(
    rpc_client: &RpcClient,
    domain: &str,
    record: Record,
) -> Result<(NameRecordHeader, Vec<u8>), SnsError> {
    let key = get_domain_key(&format!("{}.{domain}", record.as_str()), true)?;
    let res = resolve_name_registry(rpc_client, &key).await?;
    Ok(res)
}

pub async fn resolve_name_registry<'a>(
    rpc_client: &RpcClient,
    key: &Pubkey,
) -> Result<(NameRecordHeader, Vec<u8>), SnsError> {
    let acc = rpc_client.get_account(&key).await?;
    let header = NameRecordHeader::unpack_unchecked(&acc.data[0..NameRecordHeader::LEN])?;
    let data = acc.data[NameRecordHeader::LEN..].to_vec();
    Ok((header, data))
}

pub async fn resolve_reverse(rpc_client: &RpcClient, key: &Pubkey) -> Result<String, SnsError> {
    let hashed = get_hashed_name(&key.to_string());
    let (key, _) = get_seeds_and_key(
        &spl_name_service::ID,
        hashed,
        Some(&REVERSE_LOOKUP_CLASS),
        None,
    );
    let (_, data) = resolve_name_registry(rpc_client, &key).await?;
    let len = u32::from_le_bytes(data[0..4].try_into().unwrap());
    let reverse =
        String::from_utf8(data[4..4 + len as usize].to_vec()).or(Err(SnsError::InvalidReverse))?;
    Ok(reverse)
}

pub async fn get_domains_owner(
    rpc_client: &RpcClient,
    owner: Pubkey,
) -> Result<Vec<Pubkey>, SnsError> {
    let config = RpcProgramAccountsConfig {
        filters: Some(vec![
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(32, owner.to_bytes().to_vec())),
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(
                0,
                ROOT_DOMAIN_ACCOUNT.to_bytes().to_vec(),
            )),
        ]),
        with_context: None,
        account_config: RpcAccountInfoConfig {
            encoding: Some(UiAccountEncoding::Base64),
            ..Default::default()
        },
    };
    let res = rpc_client
        .get_program_accounts_with_config(&spl_name_service::ID, config.clone())
        .await?;
    let keys = res.into_iter().map(|x| x.0).collect::<Vec<_>>();
    Ok(keys)
}

pub async fn get_subdomains(
    rpc_client: &RpcClient,
    parent: Pubkey,
) -> Result<Vec<String>, SnsError> {
    let config = RpcProgramAccountsConfig {
        filters: Some(vec![
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(0, parent.to_bytes().to_vec())),
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(
                64,
                REVERSE_LOOKUP_CLASS.to_bytes().to_vec(),
            )),
        ]),
        with_context: None,
        account_config: RpcAccountInfoConfig {
            encoding: Some(UiAccountEncoding::Base64),
            ..Default::default()
        },
    };
    let res = rpc_client
        .get_program_accounts_with_config(&spl_name_service::ID, config.clone())
        .await?;

    let res = res
        .into_iter()
        .map(|(_, acc)| {
            let mut offset = NameRecordHeader::LEN;
            let len = u32::from_le_bytes(acc.data[offset..offset + 4].try_into().unwrap());
            offset += 4;
            let reverse =
                String::from_utf8(acc.data[offset..offset + len as usize].to_vec()).unwrap();
            reverse
        })
        .map(|x| x.strip_prefix('\0').unwrap().to_owned())
        .collect::<Vec<_>>();

    Ok(res)
}

pub async fn resolve_nft_owner(
    rpc_client: &RpcClient,
    domain_key: &Pubkey,
) -> Result<Option<Pubkey>, SnsError> {
    let mint_key = get_domain_mint(domain_key);
    let acc = rpc_client.get_account(&mint_key).await?;
    let mint = Mint::unpack(&acc.data)?;
    if mint.supply != 1 {
        return Ok(None);
    }

    let config = RpcProgramAccountsConfig {
        filters: Some(vec![
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(0, mint_key.to_bytes().to_vec())),
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(64, vec![1])),
            RpcFilterType::DataSize(165),
        ]),
        with_context: None,
        account_config: RpcAccountInfoConfig {
            encoding: Some(UiAccountEncoding::Base64),
            ..Default::default()
        },
    };
    let res = rpc_client
        .get_program_accounts_with_config(&spl_token::ID, config.clone())
        .await?;

    if let Some((_, acc)) = res.first() {
        return Ok(Some(
            spl_token::state::Account::unpack_unchecked(&acc.data)?.owner,
        ));
    }

    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::derivation::get_domain_key;
    use dotenv::dotenv;
    use solana_program::pubkey;

    #[tokio::test]
    async fn reverse() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let key: Pubkey = pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");
        let reverse = resolve_reverse(&client, &key).await.unwrap();
        assert_eq!(reverse, "bonfida");
    }

    #[tokio::test]
    async fn subs() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let parent: Pubkey = get_domain_key("bonfida.sol", false).unwrap();
        let mut reverse = get_subdomains(&client, parent).await.unwrap();
        reverse.sort();
        assert_eq!(reverse, vec!["dex", "naming", "test"]);
    }

    #[tokio::test]
    async fn resolve() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());

        // SOL record
        let res = resolve_owner(&client, "🇺🇸").await.unwrap();
        assert_eq!(res, pubkey!("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2"));

        // Tokenized
        let res = resolve_owner(&client, "0xluna").await.unwrap();
        assert_eq!(res, pubkey!("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2"));

        // Normal case
        let res = resolve_owner(&client, "bonfida").await.unwrap();
        assert_eq!(res, pubkey!("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA"));
    }
}
