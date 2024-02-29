use {
    borsh::BorshDeserialize,
    name_tokenizer::state::NftRecord,
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
    spl_token::state::Account,
    spl_token::state::Mint,
};

use crate::{
    derivation::{
        get_domain_key, get_domain_mint, get_hashed_name, NAME_TOKENIZER_ID, REVERSE_LOOKUP_CLASS,
        ROOT_DOMAIN_ACCOUNT,
    },
    error::SnsError,
    favourite_domain::{derive_favourite_domain_key, FavouriteDomain},
    record::{get_record_key, record_v1::check_sol_record, Record},
};

pub async fn resolve_owner(
    rpc_client: &RpcClient,
    domain: &str,
) -> Result<Option<Pubkey>, SnsError> {
    let key = get_domain_key(domain)?;

    let header = match resolve_name_registry(rpc_client, &key).await? {
        Some((h, _)) => h,
        _ => return Ok(None),
    };

    let nft_owner = resolve_nft_owner(rpc_client, &key).await?;

    if let Some(nft_owner) = nft_owner {
        return Ok(Some(nft_owner));
    }

    let sol_record_key = get_record_key(domain, Record::Sol, crate::record::RecordVersion::V1)?;
    match resolve_name_registry(rpc_client, &sol_record_key).await {
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

pub async fn resolve_record(
    rpc_client: &RpcClient,
    domain: &str,
    record: Record,
) -> Result<Option<(NameRecordHeader, Vec<u8>)>, SnsError> {
    let key = get_record_key(domain, record, crate::record::RecordVersion::V1)?;
    let res = resolve_name_registry(rpc_client, &key).await?;
    if let Some(res) = res {
        Ok(Some(res))
    } else {
        Ok(None)
    }
}

pub fn deserialize_name_registry(data: &[u8]) -> Result<(NameRecordHeader, Vec<u8>), SnsError> {
    let header = NameRecordHeader::unpack_unchecked(&data[0..NameRecordHeader::LEN])?;
    let data = data[NameRecordHeader::LEN..].to_vec();
    Ok((header, data))
}

pub fn deserialize_reverse(data: &[u8]) -> Result<String, SnsError> {
    let len = u32::from_le_bytes(data[0..4].try_into().unwrap());
    let reverse =
        String::from_utf8(data[4..4 + len as usize].to_vec()).or(Err(SnsError::InvalidReverse))?;
    Ok(reverse)
}

pub async fn resolve_name_registry(
    rpc_client: &RpcClient,
    key: &Pubkey,
) -> Result<Option<(NameRecordHeader, Vec<u8>)>, SnsError> {
    let acc = rpc_client
        .get_account_with_commitment(key, rpc_client.commitment())
        .await?
        .value;
    if let Some(acc) = acc {
        Ok(Some(deserialize_name_registry(&acc.data)?))
    } else {
        Ok(None)
    }
}

pub async fn resolve_name_registry_batch(
    rpc_client: &RpcClient,
    keys: &[Pubkey],
) -> Result<Vec<Option<(NameRecordHeader, Vec<u8>)>>, SnsError> {
    let mut res = vec![];
    for k in keys.chunks(100) {
        let accs = rpc_client.get_multiple_accounts(k).await?;
        for acc in accs {
            if let Some(acc) = acc {
                let des = deserialize_name_registry(&acc.data)?;
                res.push(Some(des))
            } else {
                res.push(None)
            }
        }
    }
    Ok(res)
}

pub async fn resolve_reverse(
    rpc_client: &RpcClient,
    key: &Pubkey,
) -> Result<Option<String>, SnsError> {
    let hashed = get_hashed_name(&key.to_string());
    let (key, _) = get_seeds_and_key(
        &spl_name_service::ID,
        hashed,
        Some(&REVERSE_LOOKUP_CLASS),
        None,
    );
    if let Some((_, data)) = resolve_name_registry(rpc_client, &key).await? {
        Ok(Some(deserialize_reverse(&data)?))
    } else {
        Ok(None)
    }
}

pub async fn resolve_reverse_batch(
    rpc_client: &RpcClient,
    keys: &[Pubkey],
) -> Result<Vec<Option<String>>, SnsError> {
    let mut res = vec![];

    let reverse_keys = keys
        .iter()
        .map(|k| {
            let hashed = get_hashed_name(&k.to_string());
            let (key, _) = get_seeds_and_key(
                &spl_name_service::ID,
                hashed,
                Some(&REVERSE_LOOKUP_CLASS),
                None,
            );
            key
        })
        .collect::<Vec<_>>();

    let reverses = resolve_name_registry_batch(rpc_client, &reverse_keys).await?;
    for r in reverses {
        if let Some((_, data)) = r {
            let des = deserialize_reverse(&data)?;
            res.push(Some(des))
        } else {
            res.push(None)
        }
    }

    Ok(res)
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

pub async fn get_record_from_mint(
    rpc_client: &RpcClient,
    mint: &Pubkey,
) -> Result<Vec<(Pubkey, solana_sdk::account::Account)>, SnsError> {
    let config = RpcProgramAccountsConfig {
        filters: Some(vec![
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(
                0,
                vec![name_tokenizer::state::Tag::ActiveRecord as u8],
            )),
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(66, mint.to_bytes().to_vec())),
        ]),
        with_context: None,
        account_config: RpcAccountInfoConfig {
            encoding: Some(UiAccountEncoding::Base64),
            ..Default::default()
        },
    };

    let res = rpc_client
        .get_program_accounts_with_config(&NAME_TOKENIZER_ID, config.clone())
        .await?;

    Ok(res)
}

pub async fn get_nft_records(
    rpc_client: &RpcClient,
    owner: &Pubkey,
) -> Result<Vec<NftRecord>, SnsError> {
    let config = RpcProgramAccountsConfig {
        filters: Some(vec![
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(32, owner.to_bytes().to_vec())),
            RpcFilterType::Memcmp(Memcmp::new_raw_bytes(64, 1u64.to_le_bytes().to_vec())),
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
        .await?
        .into_iter()
        .map(|(_, acc)| Account::unpack(&acc.data))
        .filter(Result::is_ok)
        .map(Result::unwrap)
        .collect::<Vec<_>>();

    async fn closure(rpc_client: &RpcClient, acc: &Account) -> Result<NftRecord, SnsError> {
        let record = get_record_from_mint(rpc_client, &acc.mint).await?;
        if let Some((_, acc)) = record.first() {
            let des = NftRecord::deserialize(&mut acc.data.as_slice())?;
            return Ok(des);
        }
        Err(SnsError::NftRecordDoesNotExist)
    }

    let futures = res.iter().map(|acc| closure(rpc_client, acc));

    let records = futures::future::join_all(futures)
        .await
        .into_iter()
        .filter(Result::is_ok)
        .map(Result::unwrap)
        .collect::<Vec<_>>();

    Ok(records)
}

pub async fn get_tokenized_domains(
    rpc_client: &RpcClient,
    owner: &Pubkey,
) -> Result<Vec<(String, Pubkey)>, SnsError> {
    let pubkeys = get_nft_records(rpc_client, owner)
        .await?
        .into_iter()
        .map(|r| r.name_account)
        .collect::<Vec<_>>();

    let reverses = resolve_reverse_batch(rpc_client, &pubkeys).await?;

    let mut results = vec![];

    for (rev, key) in reverses.into_iter().zip(pubkeys) {
        if let Some(rev) = rev {
            results.push((rev, key))
        }
    }

    Ok(results)
}

pub async fn get_subdomains(
    rpc_client: &RpcClient,
    parent: &Pubkey,
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

            String::from_utf8(acc.data[offset..offset + len as usize].to_vec()).unwrap()
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
    let acc = rpc_client.get_multiple_accounts(&[mint_key]).await?;
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

pub async fn get_favourite_domain(
    rpc_client: &RpcClient,
    owner: &Pubkey,
) -> Result<Option<Pubkey>, SnsError> {
    let favourite_domain_state_key = derive_favourite_domain_key(owner);
    let account = rpc_client
        .get_account_with_commitment(&favourite_domain_state_key, rpc_client.commitment())
        .await?
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
    use crate::record::record_v1::deserialize_record;
    use crate::record::Record;
    use crate::utils::test::generate_random_string;
    use dotenv::dotenv;
    use solana_program::pubkey;
    use solana_sdk::signature::Keypair;
    use solana_sdk::signer::Signer;

    #[tokio::test]
    async fn reverse() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let key: Pubkey = pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");
        let reverse = resolve_reverse(&client, &key).await.unwrap();
        assert_eq!(reverse.unwrap(), "bonfida");

        let reverse = resolve_reverse(&client, &Keypair::new().pubkey()).await;
        assert!(reverse.unwrap().is_none());
    }

    #[tokio::test]
    async fn subs() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let parent: Pubkey = get_domain_key("bonfida.sol").unwrap();
        let mut reverse = get_subdomains(&client, &parent).await.unwrap();
        reverse.sort();
        assert_eq!(reverse, vec!["dex", "naming", "test"]);
    }

    #[tokio::test]
    async fn resolve() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());

        // SOL record
        let res = resolve_owner(&client, "🇺🇸").await.unwrap();
        assert_eq!(
            res.unwrap(),
            pubkey!("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2")
        );

        // Tokenized
        let res = resolve_owner(&client, "0xluna").await.unwrap();
        assert_eq!(
            res.unwrap(),
            pubkey!("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2")
        );

        // Normal case
        let res = resolve_owner(&client, "bonfida").await.unwrap();
        assert_eq!(
            res.unwrap(),
            pubkey!("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA")
        );

        // Domain does not exist
        let res = resolve_owner(&client, &generate_random_string(20))
            .await
            .unwrap();
        assert_eq!(res, None);
    }

    #[tokio::test]
    async fn batch_resolve_reverses() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let reverses = resolve_reverse_batch(
            &client,
            &[
                pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb"),
                pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb"),
            ],
        )
        .await
        .unwrap();
        assert_eq!(
            reverses,
            vec![Some("bonfida".to_string()), Some("bonfida".to_string())]
        )
    }

    #[tokio::test]
    async fn test_resolve_record() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());

        let res = resolve_record(&client, "bonfida", Record::Url)
            .await
            .unwrap();
        assert_eq!(
            deserialize_record(&res.unwrap().1, Record::Url, &Pubkey::default()).unwrap(),
            "https://sns.id"
        );

        let res = resolve_record(&client, "bonfida", Record::Backpack)
            .await
            .unwrap();
        assert!(res.is_none());

        let res = resolve_record(&client, "🍍", Record::Eth).await.unwrap();
        assert_eq!(
            deserialize_record(&res.unwrap().1, Record::Eth, &Pubkey::default()).unwrap(),
            "0x570eDC13f9D406a2b4E6477Ddf75D5E9cCF51cd6"
        );
    }

    #[tokio::test]
    async fn test_resolve_registry() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let key = get_domain_key(&generate_random_string(20)).unwrap();
        let res = resolve_name_registry(&client, &key).await;
        assert!(res.unwrap().is_none());

        let key = get_domain_key("bonfida").unwrap();
        let res = resolve_name_registry(&client, &key).await;
        assert!(res.unwrap().is_some())
    }

    #[tokio::test]
    async fn test_get_favourite_domain() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let domain = get_favourite_domain(
            &client,
            &pubkey!("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA"),
        )
        .await
        .unwrap();
        assert_eq!(
            &domain.unwrap().to_string(),
            "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb"
        );
    }

    #[tokio::test]
    async fn test_get_tokenized_domains() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let owner = pubkey!("J6QDztZCegYTWnGUYtjqVS9d7AZoS43UbEQmMcdGeP5s");
        let domains = get_tokenized_domains(&client, &owner).await.unwrap();
        println!("{domains:?}");
    }
}
