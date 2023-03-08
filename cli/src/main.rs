use {
    base64::Engine,
    clap::{Parser, Subcommand},
    prettytable::{row, Table},
    serde::Deserialize,
    sns_sdk::non_blocking::resolve,
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_program::instruction::{AccountMeta, Instruction},
    solana_program::pubkey::Pubkey,
    solana_sdk::signer::keypair::read_keypair_file,
    solana_sdk::{signer::Signer, transaction::Transaction},
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
    #[command(arg_required_else_help = true)]
    Resolve {
        #[arg(required = true)]
        domain: Vec<String>,
    },
    #[command(arg_required_else_help = true)]
    Register {
        #[arg(required = true)]
        keypair_path: String,
        #[arg(required = true)]
        space: u64,
        #[arg(required = true)]
        domains: Vec<String>,
    },
    #[command(arg_required_else_help = true)]
    Transfer {
        #[arg(required = true)]
        domain: Vec<String>,
        owner_keypair: String,
        #[arg(required = true)]
        new_owner: String,
    },
    #[command(arg_required_else_help = true)]
    Burn {
        #[arg(required = true)]
        domain: Vec<String>,
        keypair_path: String,
    },
    #[command(arg_required_else_help = true)]
    Lookup {
        #[arg(required = true)]
        domain: Vec<String>,
    },
    #[command(arg_required_else_help = true)]
    ReverseLookup {
        #[arg(required = true)]
        key: String,
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
    #[command(arg_required_else_help = true)]
    Domains {
        #[arg(required = true)]
        owner: Vec<String>,
    },
}

const RPC_URL: &str = "https://api.mainnet-beta.solana.com";

#[allow(dead_code)]
fn get_rpc_client(url: Option<String>) -> RpcClient {
    match url {
        Some(url) => RpcClient::new(url),
        _ => RpcClient::new(RPC_URL.to_string()),
    }
}

pub fn log_error() {}

type CliResult = Result<(), Box<dyn std::error::Error>>;

async fn process_domains(rpc_client: &RpcClient, owners: Vec<String>) -> CliResult {
    println!("Resolving domains...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Link"]);
    for owner in owners {
        let owner_key = Pubkey::from_str(&owner)?;
        let domains = resolve::get_domains_owner(rpc_client, owner_key).await?;
        resolve::resolve_reverse_batch(rpc_client, &domains)
            .await?
            .into_iter()
            .flatten()
            .for_each(|x| {
                table.add_row(row![x, format!("https://naming.bonfida.org/domain/{x}")]);
            });
    }
    table.printstd();
    Ok(())
}

async fn process_resolve(rpc_client: &RpcClient, domains: Vec<String>) -> CliResult {
    println!("Resolving domains...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Owner", "Explorer"]);
    for domain in domains {
        let owner = resolve::resolve_owner(rpc_client, &domain).await?;
        table.add_row(row![
            domain,
            owner,
            format!("https://explorer.solana.com/address/{owner}")
        ]);
    }
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
    for domain in domains {
        let domain_key = sns_sdk::derivation::get_domain_key(&domain, false)?;
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
            domain,
            sig,
            format!("https://explorer.solana.com/tx/{sig}")
        ]);
    }
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
    for domain in domains {
        let domain_key = sns_sdk::derivation::get_domain_key(&domain, false)?;
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
            domain,
            sig,
            format!("https://explorer.solana.com/tx/{sig}")
        ]);
    }
    table.printstd();
    Ok(())
}

async fn process_lookup(rpc_client: &RpcClient, domains: Vec<String>) -> CliResult {
    println!("Fetching information...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Domain key", "Parent", "Owner", "Data"]);
    for domain in domains {
        let domain_key = sns_sdk::derivation::get_domain_key(&domain, false)?;
        let (header, data) = resolve::resolve_name_registry(rpc_client, &domain_key).await?;
        let data = String::from_utf8(data)?;
        table.add_row(row![
            domain,
            domain_key,
            header.parent_name,
            header.owner,
            data
        ]);
    }
    table.printstd();
    Ok(())
}

async fn process_reverse_lookup(rpc_client: &RpcClient, key: &str) -> CliResult {
    println!("Fetching information about {key}\n");
    let mut table = Table::new();
    table.add_row(row!["Public key", "Reverse"]);
    let reverse = resolve::resolve_reverse(rpc_client, &Pubkey::from_str(key)?).await?;
    table.add_row(row![key, reverse]);
    table.printstd();
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
    let client = reqwest::Client::new();
    let keypair = read_keypair_file(keypair_path)?;

    for domain in domains {
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
            domain,
            sig,
            format!("https://explorer.solana.com/tx/{sig}")
        ]);
    }
    table.printstd();
    Ok(())
}

#[tokio::main]
async fn main() {
    let args = Cli::parse();
    let rpc_client = RpcClient::new(RPC_URL.to_string());

    let res = match args.command {
        Commands::Resolve { domain } => process_resolve(&rpc_client, domain).await,
        Commands::Domains { owner } => process_domains(&rpc_client, owner).await,
        Commands::Burn {
            domain,
            keypair_path,
        } => process_burn(&rpc_client, &keypair_path, domain).await,
        Commands::Transfer {
            domain,
            owner_keypair,
            new_owner,
        } => process_transfer(&rpc_client, domain, &owner_keypair, &new_owner).await,
        Commands::Lookup { domain } => process_lookup(&rpc_client, domain).await,
        Commands::ReverseLookup { key } => process_reverse_lookup(&rpc_client, &key).await,
        Commands::Bridge {
            target_chain,
            domain,
            keypair_path,
        } => unimplemented!(),
        Commands::Register {
            domains,
            keypair_path,
            space,
        } => process_register(&rpc_client, &keypair_path, domains, space).await,
    };

    if let Err(err) = res {
        println!("Error: {err:?}")
    }
}
