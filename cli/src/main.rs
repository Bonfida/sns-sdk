use {
    clap::{Parser, Subcommand},
    sns_sdk::non_blocking::resolve,
    solana_client::nonblocking::rpc_client::RpcClient,
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
        domain: String,
    },
    #[command(arg_required_else_help = true)]
    Activity {
        #[arg(required = true)]
        domain: String,
    },
    #[command(arg_required_else_help = true)]
    Register {
        #[arg(required = true)]
        domain: String,
        #[arg(required = true)]
        keypair_path: String,
    },
    #[command(arg_required_else_help = true)]
    Transfer {
        #[arg(required = true)]
        domain: String,
        owner_keypair: String,
        #[arg(required = true)]
        new_owner: String,
    },
    #[command(arg_required_else_help = true)]
    Burn {
        #[arg(required = true)]
        domain: String,
        keypair_path: String,
    },
    #[command(arg_required_else_help = true)]
    Lookup {
        #[arg(required = true)]
        domain: String,
    },
    #[command(arg_required_else_help = true)]
    ReverseLookup {
        #[arg(required = true)]
        key: String,
    },
    #[command(arg_required_else_help = true)]
    CreateSub {
        #[arg(required = true)]
        sub: String,
        #[arg(required = true)]
        parent: String,
        #[arg(required = true)]
        keypair_path: String,
    },
    #[command(arg_required_else_help = true)]
    CreateRecord {
        #[arg(required = true)]
        sub: String,
        #[arg(required = true)]
        parent: String,
        #[arg(required = true)]
        keypair_path: String,
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
        owner: String,
    },
}

const RPC_URL: &str = "https://api.mainnet-beta.solana.com";

fn get_rpc_client(url: Option<String>) -> RpcClient {
    match url {
        Some(url) => RpcClient::new(url),
        _ => RpcClient::new(RPC_URL.to_string()),
    }
}

pub fn log_error() {}

type CliResult = Result<(), Box<std::io::Error>>;

async fn process_domains(rpc_client: &RpcClient, owner: &str) -> CliResult {
    println!("Resolving domains for {owner}...\n");
    let owner_key = Pubkey::from_str(owner).unwrap();
    let domains = resolve::get_domains_owner(rpc_client, owner_key)
        .await
        .unwrap();
    resolve::resolve_reverse_batch(rpc_client, &domains)
        .await
        .unwrap()
        .into_iter()
        .flatten()
        .for_each(|x| println!("- {x}.sol"));

    Ok(())
}

async fn process_resolve(rpc_client: &RpcClient, domain: &str) -> CliResult {
    println!("Resolving domains {domain}...\n");
    let owner = resolve::resolve_owner(rpc_client, domain).await.unwrap();
    println!("- Owner: {owner} (https://explorer.solana.com/address/{owner})");
    Ok(())
}

async fn process_burn(rpc_client: &RpcClient, keypair_path: &str, domain: &str) -> CliResult {
    println!("Burning domain ${domain}.sol");
    let domain_key = sns_sdk::derivation::get_domain_key(domain, false).unwrap();
    let keypair = read_keypair_file(keypair_path).unwrap();
    let ix = spl_name_service::instruction::delete(
        spl_name_service::ID,
        domain_key,
        keypair.pubkey(),
        keypair.pubkey(),
    )
    .unwrap();
    let mut tx = Transaction::new_with_payer(&[ix], Some(&keypair.pubkey()));
    let blockhash = rpc_client.get_latest_blockhash().await.unwrap();
    tx.partial_sign(&[&keypair], blockhash);
    let sig = rpc_client.send_and_confirm_transaction(&tx).await.unwrap();
    println!("Burned tx signature: {sig}");
    Ok(())
}

#[tokio::main]
async fn main() {
    let args = Cli::parse();
    let rpc_client = RpcClient::new(RPC_URL.to_string());

    let res = match args.command {
        Commands::Resolve { domain } => process_resolve(&rpc_client, &domain).await,
        Commands::Domains { owner } => process_domains(&rpc_client, &owner).await,
        Commands::Burn {
            domain,
            keypair_path,
        } => process_burn(&rpc_client, &keypair_path, &domain).await,
        _ => todo!(),
    };

    if let Err(err) = res {
        println!("Error: {err:?}")
    }
}
