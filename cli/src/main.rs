use anyhow::anyhow;

use {
    base64::Engine,
    clap::{Parser, Subcommand},
    console::Term,
    indicatif::{ProgressBar, ProgressState, ProgressStyle},
    prettytable::{row, Table},
    serde::Deserialize,
    sns_sdk::non_blocking::resolve,
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_program::instruction::{AccountMeta, Instruction},
    solana_program::pubkey::Pubkey,
    solana_sdk::signer::keypair::read_keypair_file,
    solana_sdk::{signer::Signer, transaction::Transaction},
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
    return format!("{domain}.sol");
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
    Term::stdout().clear_screen()?;
    table.printstd();
    Ok(())
}

async fn process_resolve(rpc_client: &RpcClient, domains: Vec<String>) -> CliResult {
    println!("Resolving domains...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Owner", "Explorer"]);

    let pb = progress_bar(domains.len());
    for (idx, domain) in domains.into_iter().enumerate() {
        let owner = resolve::resolve_owner(rpc_client, &domain).await?;
        table.add_row(row![
            format_domain(&domain),
            owner,
            format!("https://explorer.solana.com/address/{owner}")
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_screen()?;
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
            format_domain(&domain),
            sig,
            format!("https://explorer.solana.com/tx/{sig}")
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_screen()?;
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
            format_domain(&domain),
            sig,
            format!("https://explorer.solana.com/tx/{sig}")
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_screen()?;
    table.printstd();
    Ok(())
}

async fn process_lookup(rpc_client: &RpcClient, domains: Vec<String>) -> CliResult {
    println!("Fetching information...\n");
    let mut table = Table::new();
    table.add_row(row!["Domain", "Domain key", "Parent", "Owner", "Data"]);
    let pb = progress_bar(domains.len());
    for (idx, domain) in domains.into_iter().enumerate() {
        let domain_key = sns_sdk::derivation::get_domain_key(&domain, false)?;
        let (header, data) = resolve::resolve_name_registry(rpc_client, &domain_key).await?;
        let data = String::from_utf8(data)?;
        table.add_row(row![
            format_domain(&domain),
            domain_key,
            header.parent_name,
            header.owner,
            data
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_screen()?;
    table.printstd();
    Ok(())
}

async fn process_reverse_lookup(rpc_client: &RpcClient, key: &str) -> CliResult {
    println!("Fetching information about {key}\n");
    let mut table = Table::new();
    table.add_row(row!["Public key", "Reverse"]);
    let reverse = resolve::resolve_reverse(rpc_client, &Pubkey::from_str(key)?).await?;
    table.add_row(row![key, format_domain(&reverse)]);
    Term::stdout().clear_line()?;
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
            format!("https://explorer.solana.com/tx/{sig}")
        ]);
        pb.set_position(idx as u64);
    }
    pb.finish();
    Term::stdout().clear_screen()?;
    table.printstd();
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
        Commands::Bridge {
            target_chain,
            domain,
            keypair_path,
        } => unimplemented!(),
        Commands::Register {
            domains,
            keypair_path,
            space,
            url,
        } => process_register(&get_rpc_client(url), &keypair_path, domains, space).await,
    };

    if let Err(err) = res {
        println!("Error: {err:?}")
    }
}
