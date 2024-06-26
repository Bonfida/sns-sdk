use serde::Serialize;
use sns_sdk::{
    favourite_domain::register_favourite::Accounts,
    record::{self, get_record_v2_key},
    NAME_OFFERS_PROGRAM_ID,
};
use solana_account_decoder::UiAccountEncoding;
use solana_client::{
    rpc_config::{RpcAccountInfoConfig, RpcProgramAccountsConfig},
    rpc_filter::{Memcmp, RpcFilterType},
};
use solana_sdk::{bs58, signature::Keypair, system_program};
use std::collections::HashMap;

use {
    anyhow::anyhow,
    base64::Engine,
    clap::Args,
    clap::{Parser, Subcommand},
    console::Term,
    indicatif::{ProgressBar, ProgressState, ProgressStyle},
    prettytable::{row, Table},
    serde::Deserialize,
    sns_sdk::non_blocking::resolve,
    sns_sdk::{
        derivation::{get_domain_key, get_hashed_name},
        record::Record,
    },
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_program::instruction::{AccountMeta, Instruction},
    solana_program::program_pack::Pack,
    solana_program::pubkey::Pubkey,
    solana_sdk::commitment_config::{CommitmentConfig, CommitmentLevel},
    solana_sdk::signer::keypair::read_keypair_file,
    solana_sdk::{signer::Signer, transaction::Transaction},
    spl_name_service::state::NameRecordHeader,
    std::fmt::Write,
    std::str::FromStr,
};

#[derive(Debug, Parser)]
#[command(name = "sns")]
#[command(about = "Solana Name Service CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    #[command(
        arg_required_else_help = true,
        about = "Resolve the owner of the specified domain names"
    )]
    Resolve {
        #[arg(
            required = true,
            help = "The list of domains to resolve with or without .sol suffix"
        )]
        domain: Vec<String>,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(
        arg_required_else_help = true,
        about = "Register the specified domain names"
    )]
    Register {
        #[arg(
            required = true,
            help = "The path to the wallet private key used to register the domains"
        )]
        keypair_path: String,
        #[arg(
            required = true,
            help = "The space to allocate for each domain (1kB to 10kB"
        )]
        space: u64,
        #[arg(
            required = true,
            help = "The list of domains to register with or without .sol suffix"
        )]
        domains: Vec<String>,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(arg_required_else_help = true, about = "Register a favourite domain")]
    RegisterFavourite {
        #[arg(
            required = true,
            help = "The path to the wallet private key used to set the favourite domain or an owner wallet"
        )]
        owner: String,
        #[arg(required = true, help = "The domain to set as favorite")]
        domain: String,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(
        arg_required_else_help = true,
        about = "Transfer a list of domains to a new owner"
    )]
    Transfer {
        #[arg(
            required = true,
            help = "The path to the wallet private key which currently owns the domains to transfer"
        )]
        owner_keypair: String,
        #[arg(required = true, help = "The new owner of the domains")]
        new_owner: String,
        #[arg(
            required = true,
            help = "The list of domains to transfer with or without .sol suffix"
        )]
        domain: Vec<String>,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(
        arg_required_else_help = true,
        about = "⛔️ Burn a list of domain names"
    )]
    Burn {
        #[arg(
            required = true,
            help = "The path to the wallet private key which currently owns the domains to burn"
        )]
        keypair_path: String,
        #[arg(
            required = true,
            help = "The list of domains to burn with or without .sol suffix"
        )]
        domain: Vec<String>,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(
        arg_required_else_help = true,
        about = "Fetch the name registry data for the specified domain names"
    )]
    Lookup {
        #[arg(
            required = true,
            help = "The list of domains to fetch with or without .sol suffix"
        )]
        domain: Vec<String>,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(arg_required_else_help = true, about = "Perform a reverse lookup")]
    ReverseLookup {
        #[arg(required = true, help = "The public key (base58 encoded) to lookup")]
        key: String,
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
    },
    #[command(arg_required_else_help = true)]
    Bridge {
        #[arg(required = true)]
        target_chain: String,
        #[arg(required = true)]
        domain: String,
        #[arg(required = true)]
        keypair_path: String,
    },
    #[command(
        arg_required_else_help = true,
        about = "Fetch all the domain names owned for the specified wallets"
    )]
    Domains {
        #[arg(long, short, help = "Optional custom RPC URL")]
        url: Option<String>,
        #[arg(required = true, help = "The list of wallets")]
        owners: Vec<String>,
    },
    Record(RecordCommand),
}

#[derive(Debug, Args)]
pub struct RecordCommand {
    #[command(subcommand)]
    pub cmd: RecordSubCommand,
    #[clap(long, help = "Use records V2", default_value_t)]
    v2: bool,
    #[arg(long, short, help = "Optional custom RPC URL")]
    url: Option<String>,
}

#[derive(Debug, Subcommand)]
pub enum RecordSubCommand {
    #[command(about = "Gets a record content")]
    Get {
        #[clap(long, help = "The domain of the record to fetch")]
        domain: String,
        #[clap(long, help = "The record to fetch")]
        record: String,
    },
    #[command(about = "Sets a record content")]
    Set {
        #[clap(long, help = "The domain of the record to set")]
        domain: String,
        #[clap(long, help = "The record to set")]
        record: String,
        #[clap(long, help = "The content of the record")]
        content: String,
        #[clap(long, help = "The path of keypair ownning the domain")]
        keypair: String,
    },
    #[command(about = "Dump records system info")]
    SystemDump,
}

const RPC_URL: &str = "https://api.mainnet-beta.solana.com";

fn get_rpc_client(url: Option<String>) -> RpcClient {
    match url {
        Some(url) => RpcClient::new(url),
        _ => RpcClient::new(RPC_URL.to_string()),
    }
}

fn format_domain(domain: &str) -> String {
    if domain.ends_with(".sol") {
        return domain.to_owned();
    }
    format!("{domain}.sol")
}

fn make_tx_url(sig: &str) -> String {
    format!("https://explorer.solana.com/tx/{sig}")
}

pub fn progress_bar(len: usize) -> ProgressBar {
    let pb = ProgressBar::new(len as u64);
    pb.set_style(
        ProgressStyle::with_template(
            "{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] ({eta})",
        )
        .unwrap()
        .with_key("eta", |state: &ProgressState, w: &mut dyn Write| {
            write!(w, "{:.1}s", state.eta().as_secs_f64()).unwrap()
        })
        .progress_chars("#>-"),
    );
    pb
}

type CliResult = Result<(), Box<dyn std::error::Error>>;

async fn process_domains(rpc_client: &RpcClient, owners: Vec<String>) -> CliResult {
    println!("Resolving domains...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Owner", "Link"]);
    let pb = progress_bar(owners.len());

    for (idx, owner) in owners.into_iter().enumerate() {
        let owner_key = Pubkey::from_str(&owner)?;
        let domains = resolve::get_domains_owner(rpc_client, owner_key).await?;
        resolve::resolve_reverse_batch(rpc_client, &domains)
            .await?
            .into_iter()
            .flatten()
            .for_each(|x| {
                table.add_row(row![
                    format_domain(&x),
                    owner,
                    format!("https://naming.bonfida.org/domain/{x}")
                ]);
            });
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

async fn process_resolve(rpc_client: &RpcClient, domains: Vec<String>) -> CliResult {
    println!("Resolving domains...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Owner", "Explorer"]);

    let pb = progress_bar(domains.len());
    for (idx, domain) in domains.into_iter().enumerate() {
        let row = match resolve::resolve_owner(rpc_client, &domain).await? {
            Some(owner) => row![
                format_domain(&domain),
                owner,
                format!("https://explorer.solana.com/address/{owner}")
            ],
            _ => row![format_domain(&domain), "Domain not found"],
        };
        table.add_row(row);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

async fn process_burn(
    rpc_client: &RpcClient,
    keypair_path: &str,
    domains: Vec<String>,
) -> CliResult {
    println!("Burning domain...");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Transaction", "Explorer"]);
    let pb = progress_bar(domains.len());
    for (idx, domain) in domains.into_iter().enumerate() {
        let domain_key = sns_sdk::derivation::get_domain_key(&domain)?;
        let keypair = read_keypair_file(keypair_path)?;
        let ix = spl_name_service::instruction::delete(
            spl_name_service::ID,
            domain_key,
            keypair.pubkey(),
            keypair.pubkey(),
        )?;
        let mut tx = Transaction::new_with_payer(&[ix], Some(&keypair.pubkey()));
        let blockhash = rpc_client.get_latest_blockhash().await?;
        tx.partial_sign(&[&keypair], blockhash);
        let sig = rpc_client.send_and_confirm_transaction(&tx).await?;

        table.add_row(row![
            format_domain(&domain),
            sig,
            make_tx_url(&sig.to_string())
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

async fn process_transfer(
    rpc_client: &RpcClient,
    domains: Vec<String>,
    owner_keypair: &str,
    new_owner: &str,
) -> CliResult {
    println!("Transfering domains...");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Transaction", "Explorer"]);
    let pb = progress_bar(domains.len());
    for (idx, domain) in domains.into_iter().enumerate() {
        let domain_key = sns_sdk::derivation::get_domain_key(&domain)?;
        let keypair = read_keypair_file(owner_keypair)?;
        let ix = spl_name_service::instruction::transfer(
            spl_name_service::ID,
            Pubkey::from_str(new_owner)?,
            domain_key,
            keypair.pubkey(),
            None,
        )?;
        let mut tx = Transaction::new_with_payer(&[ix], Some(&keypair.pubkey()));
        let blockhash = rpc_client.get_latest_blockhash().await?;
        tx.partial_sign(&[&keypair], blockhash);
        let sig = rpc_client.send_and_confirm_transaction(&tx).await?;
        table.add_row(row![
            format_domain(&domain),
            sig,
            make_tx_url(&sig.to_string())
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

async fn process_lookup(rpc_client: &RpcClient, domains: Vec<String>) -> CliResult {
    println!("Fetching information...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Domain key", "Parent", "Owner", "Data"]);
    let pb = progress_bar(domains.len());
    for (idx, domain) in domains.into_iter().enumerate() {
        let sns_sdk::derivation::DomainKeyWithParent {
            key: domain_key,
            parent,
        } = sns_sdk::derivation::get_domain_key_with_parent(&domain)?;
        let row = match resolve::resolve_name_registry(rpc_client, &domain_key).await? {
            Some((header, data)) => {
                let data = String::from_utf8(data)?;
                row![
                    format_domain(&domain),
                    domain_key,
                    header.parent_name,
                    header.owner,
                    data
                ]
            }
            _ => row![format_domain(&domain), domain_key, parent, "N/A", "N/A"],
        };
        table.add_row(row);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

async fn process_reverse_lookup(rpc_client: &RpcClient, key: &str) -> CliResult {
    println!("Fetching information about {key}\n");

    if let Some(reverse) = resolve::resolve_reverse(rpc_client, &Pubkey::from_str(key)?).await? {
        let mut table = Table::new();
        table.add_row(row!["Public key", "Reverse"]);
        table.add_row(row![key, format_domain(&reverse)]);
        Term::stdout().clear_line()?;
        table.printstd();
    } else {
        Term::stdout().clear_line()?;
        println!("Domain not found - Are you sure it exists?")
    }

    Ok(())
}

#[derive(Deserialize)]
struct RegisterResponse {
    #[allow(dead_code)]
    pub s: String,
    pub result: Vec<ApiResult>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiResult {
    pub program_id: String,
    pub data: String,
    pub keys: Vec<Key>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Key {
    pub pubkey: String,
    pub is_writable: bool,
    pub is_signer: bool,
}

async fn process_register(
    rpc_client: &RpcClient,
    keypair_path: &str,
    domains: Vec<String>,
    space: u64,
) -> CliResult {
    println!("Registering domains...");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Transaction", "Explorer"]);
    let pb = progress_bar(domains.len());
    let client = reqwest::Client::new();
    let keypair = read_keypair_file(keypair_path)?;

    let re = regex::Regex::new(r"^[a-z\d\-_]+$").unwrap();

    for (idx, domain) in domains.into_iter().enumerate() {
        if !re.is_match(&domain) {
            return Err(anyhow!("Invalid domain").into());
        }
        let response = client
            .get(format!(
                "https://sns-sdk-proxy.bonfida.workers.dev/register?buyer={}&domain={}&space={}",
                keypair.pubkey(),
                domain,
                space
            ))
            .send()
            .await?
            .json::<RegisterResponse>()
            .await?;

        let mut ixs = vec![];
        for r in response.result {
            let program_id = Pubkey::from_str(&r.program_id)?;
            let mut accounts = vec![];
            r.keys.into_iter().for_each(|key| {
                accounts.push(if key.is_writable {
                    AccountMeta::new(Pubkey::from_str(&key.pubkey).unwrap(), key.is_signer)
                } else {
                    AccountMeta::new_readonly(Pubkey::from_str(&key.pubkey).unwrap(), key.is_signer)
                })
            });
            let data = base64::engine::general_purpose::URL_SAFE.decode(r.data)?;
            ixs.push(Instruction::new_with_bytes(program_id, &data, accounts))
        }

        let mut tx = Transaction::new_with_payer(&ixs, Some(&keypair.pubkey()));
        let blockhash = rpc_client.get_latest_blockhash().await?;
        tx.partial_sign(&[&keypair], blockhash);
        let sig = rpc_client.send_and_confirm_transaction(&tx).await?;
        table.add_row(row![
            format_domain(&domain),
            sig,
            make_tx_url(&sig.to_string())
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

enum OwnerKind {
    Keypair(Keypair),
    Pubkey(Pubkey),
}

impl OwnerKind {
    fn owner(&self) -> Pubkey {
        match self {
            OwnerKind::Keypair(keypair) => keypair.pubkey(),
            OwnerKind::Pubkey(pk) => *pk,
        }
    }
}

async fn process_register_favourite(
    rpc_client: &RpcClient,
    owner_keypair_path_or_address: &str,
    domain: &str,
) -> CliResult {
    println!("Registering favourite domain...");
    let owner_kind = {
        match read_keypair_file(owner_keypair_path_or_address) {
            Ok(kp) => OwnerKind::Keypair(kp),
            Err(e) => match Pubkey::from_str(owner_keypair_path_or_address) {
                Ok(owner) => OwnerKind::Pubkey(owner),
                Err(parse_pk_error) => {
                    return Err(anyhow!(
                    "Owner was not a valid keypair nor a valid address: {e:?}, {parse_pk_error:?}"
                )
                    .into())
                }
            },
        }
    };
    let owner = owner_kind.owner();
    let domain_key = get_domain_key(domain)?;
    let ix = sns_sdk::favourite_domain::get_register_favourite_instruction(
        NAME_OFFERS_PROGRAM_ID,
        Accounts {
            owner: &owner,
            name: &domain_key,
            favourite_domain: &sns_sdk::favourite_domain::derive_favourite_domain_key(&owner),
            system_program: &system_program::ID,
        },
        sns_sdk::favourite_domain::register_favourite::Params {},
    );
    let blockhash = rpc_client.get_latest_blockhash().await?;

    match owner_kind {
        OwnerKind::Keypair(keypair) => {
            let tx = Transaction::new_signed_with_payer(
                &[ix],
                Some(&keypair.pubkey()),
                &[&keypair],
                blockhash,
            );
            let sig = rpc_client.send_and_confirm_transaction(&tx).await?;
            println!("Favourite set, txid: {sig}");
        }
        OwnerKind::Pubkey(_) => {
            let mut tx = Transaction::new_with_payer(&[ix.clone()], Some(&owner));
            tx.message.recent_blockhash = blockhash;

            println!(
                "base58 register favourite tx: {}",
                bs58::encode(bincode::serialize(&tx).unwrap()).into_string()
            );
        }
    }

    Ok(())
}

async fn process_record_set(
    rpc_client: &RpcClient,
    domain: &str,
    record_str: &str,
    content: &str,
    keypair_path: &str,
) -> CliResult {
    let mut ixs = vec![];
    let mut table = Table::new();
    table.add_row(row!["Transaction", "Signature"]);

    let record = Record::try_from_str(record_str)?;
    let keypair = read_keypair_file(keypair_path)?;
    let data = sns_sdk::record::record_v1::serialize_record(content, record)?;
    let key = record::get_record_key(
        domain,
        Record::try_from_str(record_str)?,
        record::RecordVersion::V1,
    )?;
    let hashed_name = get_hashed_name(&format!("\x01{record_str}"));
    let parent = get_domain_key(domain)?;

    let lamports = rpc_client
        .get_minimum_balance_for_rent_exemption(data.len() + NameRecordHeader::LEN)
        .await?;

    let acc = rpc_client
        .get_account_with_commitment(&key, CommitmentConfig::default())
        .await?;

    if let Some(value) = acc.value {
        if value.data.len() - NameRecordHeader::LEN != data.len() {
            // Delete existing record
            // This is the only way to handle the account resizing
            let ix = spl_name_service::instruction::delete(
                spl_name_service::ID,
                key,
                keypair.pubkey(),
                keypair.pubkey(),
            )?;

            // Clean up transaction
            let mut tx = Transaction::new_with_payer(&[ix], Some(&keypair.pubkey()));
            let blockhash = rpc_client.get_latest_blockhash().await?;
            tx.sign(&[&keypair], blockhash);

            let sig = rpc_client
                .send_and_confirm_transaction_with_spinner(&tx)
                .await?;
            table.add_row(row!["Clean up", make_tx_url(&sig.to_string())]);

            // Create the record
            let ix = spl_name_service::instruction::create(
                spl_name_service::ID,
                spl_name_service::instruction::NameRegistryInstruction::Create {
                    hashed_name,
                    lamports,
                    space: data.len() as u32,
                },
                key,
                keypair.pubkey(),
                keypair.pubkey(),
                None,
                Some(parent),
                Some(keypair.pubkey()),
            )?;
            ixs.push(ix);
        }
    } else {
        let ix: Instruction = spl_name_service::instruction::create(
            spl_name_service::ID,
            spl_name_service::instruction::NameRegistryInstruction::Create {
                hashed_name,
                lamports,
                space: data.len() as u32,
            },
            key,
            keypair.pubkey(),
            keypair.pubkey(),
            None,
            Some(parent),
            Some(keypair.pubkey()),
        )?;
        ixs.push(ix);
    }

    // Update
    let ix = spl_name_service::instruction::update(
        spl_name_service::ID,
        0,
        data,
        key,
        keypair.pubkey(),
        Some(parent),
    )?;
    ixs.push(ix);

    let mut tx = Transaction::new_with_payer(&ixs, Some(&keypair.pubkey()));
    let blockhash = rpc_client.get_latest_blockhash().await?;
    tx.sign(&[&keypair], blockhash);

    let sig = rpc_client
        .send_and_confirm_transaction_with_spinner_and_commitment(
            &tx,
            CommitmentConfig {
                commitment: CommitmentLevel::Processed,
            },
        )
        .await?;
    table.add_row(row!["Update record", make_tx_url(&sig.to_string())]);

    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();

    Ok(())
}

async fn process_record_get(
    rpc_client: &RpcClient,
    domain: &str,
    record_str: &str,
    v2: bool,
) -> CliResult {
    let record = Record::try_from_str(record_str)?;

    let key = record::get_record_key(
        domain,
        Record::try_from_str(record_str)?,
        if v2 {
            record::RecordVersion::V2
        } else {
            record::RecordVersion::V1
        },
    )?;
    let mut table = Table::new();
    if let Some((_, data)) = resolve::resolve_name_registry(rpc_client, &key).await? {
        let des = record::record_v1::deserialize_record(&data, record, &key)?;

        table.add_row(row!["Domain", "Record", "Content"]);
        table.add_row(row![format_domain(domain), record_str, des]);
    }
    Term::stdout().clear_to_end_of_screen()?;
    table.printstd();
    Ok(())
}

#[derive(Serialize)]
pub struct SystemDumpRecord {
    domain: String,
    record_type: Option<String>,
    record_key: String,
}

pub async fn process_system_dump(rpc_client: &RpcClient) -> CliResult {
    let record_v2_accounts = rpc_client
        .get_program_accounts_with_config(
            &spl_name_service::ID,
            RpcProgramAccountsConfig {
                filters: Some(vec![RpcFilterType::Memcmp(Memcmp::new_raw_bytes(
                    64,
                    sns_records::central_state::KEY.as_ref().to_vec(),
                ))]),
                account_config: RpcAccountInfoConfig {
                    encoding: Some(UiAccountEncoding::Base64),
                    data_slice: None,
                    commitment: None,
                    min_context_slot: None,
                },
                with_context: None,
            },
        )
        .await?;
    eprintln!("Found {} v2 records", record_v2_accounts.len());
    let mut by_parent: HashMap<Pubkey, Vec<Pubkey>> = HashMap::new();
    for (k, a) in record_v2_accounts {
        let spl_header = NameRecordHeader::unpack_unchecked(&a.data[..NameRecordHeader::LEN])?;
        let entry = by_parent.entry(spl_header.parent_name);
        match entry {
            std::collections::hash_map::Entry::Occupied(mut o) => o.get_mut().push(k),
            std::collections::hash_map::Entry::Vacant(v) => {
                v.insert(vec![k]);
            }
        }
    }
    let parent_domains = by_parent.keys().cloned().collect::<Vec<_>>();
    eprintln!("From a total of {} domains", by_parent.keys().len());
    let reverse_lookup_keys =
        sns_sdk::non_blocking::resolve::resolve_reverse_batch(rpc_client, &parent_domains).await?;
    for (domain, name) in parent_domains
        .into_iter()
        .zip(reverse_lookup_keys.into_iter())
    {
        if name.is_none() {
            continue;
        }
        let name = name.unwrap();
        use Record::*;
        let possible_records = [
            Ipfs, Arwv, Sol, Eth, Btc, Ltc, Doge, Email, Url, Discord, Github, Reddit, Twitter,
            Telegram, Pic, Shdw, Point, Bsc, Injective, Backpack, A, AAAA, CNAME, TXT, BASE,
        ]
        .into_iter()
        .map(|r| get_record_v2_key(&name, r).map(|res| (res, r)))
        .collect::<Result<HashMap<_, _>, _>>()?;
        for record in by_parent.get(&domain).unwrap() {
            let record_type = possible_records.get(record);
            println!(
                "{}",
                serde_json::to_string(&SystemDumpRecord {
                    domain: name.clone(),
                    record_type: record_type.map(|r| r.as_str().to_owned()),
                    record_key: record.to_string()
                })?
            )
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() {
    let args = Cli::parse();

    let res = match args.command {
        Commands::Resolve { domain, url } => process_resolve(&get_rpc_client(url), domain).await,
        Commands::Domains { owners, url } => process_domains(&get_rpc_client(url), owners).await,
        Commands::Burn {
            domain,
            keypair_path,
            url,
        } => process_burn(&get_rpc_client(url), &keypair_path, domain).await,
        Commands::Transfer {
            domain,
            owner_keypair,
            new_owner,
            url,
        } => process_transfer(&get_rpc_client(url), domain, &owner_keypair, &new_owner).await,
        Commands::Lookup { domain, url } => process_lookup(&get_rpc_client(url), domain).await,
        Commands::ReverseLookup { key, url } => {
            process_reverse_lookup(&get_rpc_client(url), &key).await
        }
        Commands::Bridge { .. } => unimplemented!(),
        Commands::Register {
            domains,
            keypair_path,
            space,
            url,
        } => process_register(&get_rpc_client(url), &keypair_path, domains, space).await,
        Commands::RegisterFavourite { owner, domain, url } => {
            process_register_favourite(&get_rpc_client(url), &owner, &domain).await
        }
        Commands::Record(RecordCommand { cmd, v2, url }) => match cmd {
            RecordSubCommand::Get { domain, record } => {
                process_record_get(&get_rpc_client(url), &domain, &record, v2).await
            }
            RecordSubCommand::Set {
                domain,
                record,
                content,
                keypair,
            } => {
                if v2 {
                    unimplemented!()
                } else {
                    process_record_set(&get_rpc_client(url), &domain, &record, &content, &keypair)
                        .await
                }
            }
            RecordSubCommand::SystemDump {} => process_system_dump(&get_rpc_client(url)).await,
        },
    };

    if let Err(err) = res {
        println!("Error: {err:?}")
    }
}
