use {
    solana_account_decoder::UiAccountEncoding,
    solana_client::{
        client_error::{ClientError, ClientErrorKind},
        rpc_client::RpcClient,
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
    favourite_domain::{derive_favorite_domain_key, FavouriteDomain},
    record::{get_record_key, record_v1::check_sol_record, Record},
};

pub fn resolve_owner(rpc_client: &RpcClient, domain: &str) -> Result<Option<Pubkey>, SnsError> {
    let key = get_domain_key(domain)?;

    let header = match resolve_name_registry(rpc_client, &key)? {
        Some((h, _)) => h,
        _ => return Ok(None),
    };

    let nft_owner = resolve_nft_owner(rpc_client, &key)?;

    if let Some(nft_owner) = nft_owner {
        return Ok(Some(nft_owner));
    }

    let sol_record_key = get_record_key(domain, Record::Sol, crate::record::RecordVersion::V1)?;
    match resolve_name_registry(rpc_client, &sol_record_key) {
        Ok(Some((_, data))) => {
            let data = &data[..96];
            let record = [&data[..32], &sol_record_key.to_bytes()].concat();
            let sig = &data[32..];
            let encoded = hex::encode(record);
            if check_sol_record(encoded.as_bytes(), sig, header.owner)? {
                let owner = Pubkey::new_from_array(
                    data[0..32]
                        .try_into()
                        .map_err(|_| SnsError::InvalidPubkey)?,
                );
                return Ok(Some(owner));
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

    Ok(Some(header.owner))
}

pub fn resolve_record(
    rpc_client: &RpcClient,
    domain: &str,
    record: Record,
) -> Result<Option<(NameRecordHeader, Vec<u8>)>, SnsError> {
    let key = get_record_key(domain, record, crate::record::RecordVersion::V1)?;
    let res = resolve_name_registry(rpc_client, &key)?;
    if let Some(res) = res {
        Ok(Some(res))
    } else {
        Ok(None)
    }
}

pub fn resolve_name_registry(
    rpc_client: &RpcClient,
    key: &Pubkey,
) -> Result<Option<(NameRecordHeader, Vec<u8>)>, SnsError> {
    let acc = rpc_client
        .get_account_with_commitment(key, rpc_client.commitment())?
        .value;
    if let Some(acc) = acc {
        let header = NameRecordHeader::unpack_unchecked(&acc.data[0..NameRecordHeader::LEN])?;
        let data = acc.data[NameRecordHeader::LEN..].to_vec();
        Ok(Some((header, data)))
    } else {
        Ok(None)
    }
}

pub fn resolve_reverse(rpc_client: &RpcClient, key: &Pubkey) -> Result<Option<String>, SnsError> {
    let hashed = get_hashed_name(&key.to_string());
    let (key, _) = get_seeds_and_key(
        &spl_name_service::ID,
        hashed,
        Some(&REVERSE_LOOKUP_CLASS),
        None,
    );
    if let Some((_, data)) = resolve_name_registry(rpc_client, &key)? {
        let len = u32::from_le_bytes(data[0..4].try_into().unwrap());
        let reverse = String::from_utf8(data[4..4 + len as usize].to_vec())
            .or(Err(SnsError::InvalidReverse))?;
        Ok(Some(reverse))
    } else {
        Ok(None)
    }
}

pub fn get_domains_owner(rpc_client: &RpcClient, owner: Pubkey) -> Result<Vec<Pubkey>, SnsError> {
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
    let res = rpc_client.get_program_accounts_with_config(&spl_name_service::ID, config)?;
    let keys = res.into_iter().map(|x| x.0).collect::<Vec<_>>();
    Ok(keys)
}

pub fn get_subdomains(rpc_client: &RpcClient, parent: Pubkey) -> Result<Vec<String>, SnsError> {
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
    let res = rpc_client.get_program_accounts_with_config(&spl_name_service::ID, config)?;

    let res = res
        .into_iter()
        .map(|(_, acc)| {
            let mut offset = NameRecordHeader::LEN;
            let len = u32::from_le_bytes(acc.data[offset..offset + 4].try_into().unwrap());
            offset += 4;
            String::from_utf8(acc.data[offset..offset + len as usize].to_vec()).unwrap()
        })
        .map(|x| x.strip_prefix('\0').unwrap().to_owned())
        .collect::<Vec<_>>();

    Ok(res)
}

pub fn resolve_nft_owner(
    rpc_client: &RpcClient,
    domain_key: &Pubkey,
) -> Result<Option<Pubkey>, SnsError> {
    let mint_key = get_domain_mint(domain_key);
    let acc = rpc_client.get_multiple_accounts(&[mint_key])?;
    let acc = acc.first().ok_or(SnsError::InvalidDomain)?;
    if acc.is_none() {
        return Ok(None);
    }
    let mint = Mint::unpack(&acc.as_ref().unwrap().data)?;
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
    let res = rpc_client.get_program_accounts_with_config(&spl_token::ID, config)?;

    if let Some((_, acc)) = res.first() {
        return Ok(Some(
            spl_token::state::Account::unpack_unchecked(&acc.data)?.owner,
        ));
    }

    Ok(None)
}

pub async fn get_favourite_domain(
    rpc_client: &RpcClient,
    owner: &Pubkey,
) -> Result<Option<Pubkey>, SnsError> {
    let favourite_domain_state_key = derive_favorite_domain_key(owner);
    let account = rpc_client
        .get_account_with_commitment(&favourite_domain_state_key, rpc_client.commitment())?
        .value;
    if let Some(a) = account {
        let parsed = FavouriteDomain::parse(&a.data)?;
        Ok(Some(parsed.name_account))
    } else {
        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::derivation::get_domain_key;
    use crate::utils::test::generate_random_string;
    use dotenv::dotenv;
    use solana_program::pubkey;

    #[test]
    fn test_reverse() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let key: Pubkey = pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");
        let reverse = resolve_reverse(&client, &key).unwrap();
        assert_eq!(reverse.unwrap(), "bonfida");
    }

    #[test]
    fn test_subs() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let parent: Pubkey = get_domain_key("bonfida.sol").unwrap();
        let mut reverse = get_subdomains(&client, parent).unwrap();
        reverse.sort();
        assert_eq!(reverse, vec!["dex", "naming", "test"]);
    }

    #[test]
    fn test_resolve_owner() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());

        // SOL record
        let res = resolve_owner(&client, "🇺🇸").unwrap();
        assert_eq!(
            res.unwrap(),
            pubkey!("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2")
        );

        // Tokenized
        let res = resolve_owner(&client, "0xluna").unwrap();
        assert_eq!(
            res.unwrap(),
            pubkey!("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2")
        );

        // Normal case
        let res = resolve_owner(&client, "bonfida").unwrap();
        assert_eq!(
            res.unwrap(),
            pubkey!("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA")
        );

        // Domain does not exist
        let res = resolve_owner(&client, &generate_random_string(20)).unwrap();
        assert_eq!(res, None);

        // Error
        let res = resolve_owner(&RpcClient::new(""), "bonfida");
        assert!(res.is_err())
    }

    #[test]
    fn test_resolve_record() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());

        let res = resolve_record(&client, "bonfida", Record::Url).unwrap();
        assert_eq!(
            String::from_utf8(res.unwrap().1)
                .unwrap()
                .trim_end_matches('\0'),
            "https://sns.id"
        );

        let res = resolve_record(&client, "bonfida", Record::Backpack).unwrap();
        assert!(res.is_none())
    }
}
