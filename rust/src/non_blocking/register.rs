use solana_client::nonblocking::rpc_client::RpcClient;
use solana_program::{message::Message, pubkey::Pubkey, sysvar};
use solana_sdk::transaction::Transaction;
use spl_associated_token_account::get_associated_token_address;

use crate::{
    derivation::{get_domain_key, get_reverse_key, ROOT_DOMAIN_ACCOUNT},
    error::SnsError,
    register::{
        create::{Accounts, Params},
        get_register_instruction, PYTH_MAPPING_ACC, PYTH_PRICE_PRODUCT_ACCOUNTS, REFERRERS,
        REGISTER_PROGRAM_ID, USDC_MINT, VAULT_OWNER,
    },
};

pub async fn register_domain_name(
    rpc_client: &RpcClient,
    name: &str,
    space: u32,
    buyer: &Pubkey,
    buyer_token_account: &Pubkey,
    mint: Option<&Pubkey>,
    referrer_key: Option<&Pubkey>,
) -> Result<Transaction, SnsError> {
    let central_state =
        Pubkey::find_program_address(&[REGISTER_PROGRAM_ID.as_ref()], &REGISTER_PROGRAM_ID).0;
    let name_account = get_domain_key(name)?;
    let reverse_lookup_account = get_reverse_key(name)?;
    let derived_state =
        Pubkey::find_program_address(&[name_account.as_ref()], &REGISTER_PROGRAM_ID).0;
    let referrer_idx = if let Some(referrer) = referrer_key {
        REFERRERS
            .iter()
            .enumerate()
            .find_map(|(i, k)| if k == referrer { Some(i as u16) } else { None })
    } else {
        None
    };
    let mint = mint.unwrap_or(&USDC_MINT);
    let mut instructions = vec![];
    let referrer_token_account = if referrer_idx.is_some() {
        let referrer_token_account =
            spl_associated_token_account::get_associated_token_address(referrer_key.unwrap(), mint);
        let account = rpc_client
            .get_account_with_commitment(&referrer_token_account, rpc_client.commitment())
            .await?
            .value;
        if account.is_none() {
            let create_account_instruction =
                spl_associated_token_account::instruction::create_associated_token_account(
                    buyer,
                    &referrer_token_account,
                    mint,
                    &spl_token::ID,
                );
            instructions.push(create_account_instruction);
        }
        Some(referrer_token_account)
    } else {
        None
    };
    let (pyth_price_account, pyth_product_account) = PYTH_PRICE_PRODUCT_ACCOUNTS
        .iter()
        .find_map(|(m, price, product)| {
            if m == mint {
                Some((price, product))
            } else {
                None
            }
        })
        .ok_or(SnsError::UnsupportedMint)?;
    let vault = get_associated_token_address(&VAULT_OWNER, mint);
    let instruction = get_register_instruction(
        REGISTER_PROGRAM_ID,
        Accounts {
            naming_service_program: &spl_name_service::ID,
            root_domain: &ROOT_DOMAIN_ACCOUNT,
            name: &name_account,
            reverse_lookup: &reverse_lookup_account,
            system_program: &Pubkey::default(),
            central_state: &central_state,
            buyer,
            buyer_token_source: buyer_token_account,
            pyth_mapping_acc: &PYTH_MAPPING_ACC,
            pyth_product_acc: pyth_product_account,
            pyth_price_acc: pyth_price_account,
            vault: &vault,
            spl_token_program: &spl_token::ID,
            rent_sysvar: &sysvar::rent::ID,
            state: &derived_state,
            referrer_account_opt: referrer_token_account.as_ref(),
        },
        Params {
            name: name.to_owned(),
            space,
            referrer_idx_opt: referrer_idx,
        },
    );
    instructions.push(instruction);
    let message = Message::new(&instructions, Some(buyer));
    let transaction = Transaction::new_unsigned(message);
    Ok(transaction)
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::register::FIDA_MINT;
    use crate::utils::test::generate_random_string;
    use dotenv::dotenv;

    #[tokio::test]
    async fn test_registration() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let mut tx = register_domain_name(
            &client,
            &generate_random_string(10),
            1_000,
            &VAULT_OWNER,
            &get_associated_token_address(&VAULT_OWNER, &FIDA_MINT),
            Some(&FIDA_MINT),
            None,
        )
        .await
        .unwrap();
        let blockhash = client.get_latest_blockhash().await.unwrap();
        tx.message.recent_blockhash = blockhash;
        let res = client.simulate_transaction(&tx).await.unwrap();
        assert!(res.value.err.is_none())
    }

    #[tokio::test]
    async fn test_registration_ref() {
        dotenv().ok();
        let client = RpcClient::new(std::env::var("RPC_URL").unwrap());
        let mut tx = register_domain_name(
            &client,
            &generate_random_string(10),
            1_000,
            &VAULT_OWNER,
            &get_associated_token_address(&VAULT_OWNER, &FIDA_MINT),
            Some(&FIDA_MINT),
            Some(&REFERRERS[2]),
        )
        .await
        .unwrap();
        let blockhash = client.get_latest_blockhash().await.unwrap();
        tx.message.recent_blockhash = blockhash;
        let res = client.simulate_transaction(&tx).await.unwrap();
        assert!(res.value.err.is_none())
    }
}
