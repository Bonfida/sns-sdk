use bonfida_utils::InstructionsAccount;
use solana_program::{instruction::Instruction, pubkey};
use solana_sdk::pubkey::Pubkey;

pub const REGISTER_PROGRAM_ID: Pubkey = pubkey!("jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR");

pub const REFERRERS: [Pubkey; 3] = [
    pubkey!("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1"), // Test wallet
    pubkey!("DM1jJCkZZEwY5tmWbgvKRxsDFzXCdbfrYCCH1CtwguEs"), // 4Everland
    pubkey!("ADCp4QXFajHrhy4f43pD6GJFtQLkdBY2mjS9DfCk7tNW"), // Bandit network
];

pub const USDC_MINT: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
pub const USDT_MINT: Pubkey = pubkey!("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
pub const SOL_MINT: Pubkey = pubkey!("So11111111111111111111111111111111111111112");
pub const FIDA_MINT: Pubkey = pubkey!("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
// pub const ETH_MINT: Pubkey = pubkey!("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk");
// pub const GMT_MINT: Pubkey = pubkey!("7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx");
// pub const GST_MINT: Pubkey = pubkey!("AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB");
// pub const MSOL_MINT: Pubkey = pubkey!("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
// pub const BONK_MINT: Pubkey = pubkey!("6dhTynDkYsVM7cbF7TKfC9DWB636TcEM935fq7JzL2ES");
// pub const BAT_MINT: Pubkey = pubkey!("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
pub const PYTH_PROGRAM_ID: Pubkey = pubkey!("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
pub const PYTH_MAPPING_ACC: Pubkey = pubkey!("AHtgzX45WTKfkPG53L6WYhGEXwQkN1BVknET3sVsLL8J");

pub const PYTH_PRICE_PRODUCT_ACCOUNTS: [(Pubkey, Pubkey, Pubkey); 4] = [
    (
        USDC_MINT,
        pubkey!("Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"),
        pubkey!("8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb"),
    ),
    (
        USDT_MINT,
        pubkey!("3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL"),
        pubkey!("Av6XyAMJnyi68FdsKSPYgzfXGjYrrt6jcAMwtvzLCqaM"),
    ),
    (
        SOL_MINT,
        pubkey!("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG"),
        pubkey!("ALP8SdU9oARYVLgLR7LrqMNCYBnhtnQz1cj6bwgwQmgj"),
    ),
    (
        FIDA_MINT,
        pubkey!("ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF"),
        pubkey!("HyEB4Goiv7QyfFStaBn49JqQzSTV1ybtVikwsMLH1f2M"),
    ),
];

pub const VAULT_OWNER: Pubkey = pubkey!("GcWEQ9K78FV7LEHteFVciYApERk5YvQuFDQPk1yYJVXi");

pub enum ProgramInstruction {
    Create = 13,
}

pub mod create {
    use bonfida_utils::{BorshSize, InstructionsAccount};
    use borsh::{BorshDeserialize, BorshSerialize};
    use solana_sdk::pubkey::Pubkey;

    #[derive(BorshDeserialize, BorshSerialize, BorshSize, Debug)]
    /// The required parameters for the `create` instruction
    pub struct Params {
        pub name: String,
        pub space: u32,
        pub referrer_idx_opt: Option<u16>,
    }

    #[derive(InstructionsAccount)]
    /// The required accounts for the `create` instruction
    pub struct Accounts<'a, T> {
        /// The naming service program ID
        pub naming_service_program: &'a T,
        /// The root domain account       
        pub root_domain: &'a T,
        /// The name account
        #[cons(writable)]
        pub name: &'a T,
        /// The reverse look up account   
        #[cons(writable)]
        pub reverse_lookup: &'a T,
        /// The system program account
        pub system_program: &'a T,
        /// The central state account
        pub central_state: &'a T,
        /// The buyer account     
        #[cons(writable, signer)]
        pub buyer: &'a T,
        /// The buyer token account       
        #[cons(writable)]
        pub buyer_token_source: &'a T,
        /// The Pyth mapping account
        pub pyth_mapping_acc: &'a T,
        /// The Pyth product account
        pub pyth_product_acc: &'a T,
        /// The Pyth price account
        pub pyth_price_acc: &'a T,
        /// The vault account     
        #[cons(writable)]
        pub vault: &'a T,
        /// The SPL token program
        pub spl_token_program: &'a T,
        /// The rent sysvar account
        pub rent_sysvar: &'a T,
        /// The state auction account
        pub state: &'a T,
        /// The *optional* referrer token account to receive a portion of fees.
        /// The token account owner has to be whitelisted.
        #[cons(writable)]
        pub referrer_account_opt: Option<&'a T>,
    }
}

pub fn get_register_instruction(
    program_id: Pubkey,
    accounts: create::Accounts<Pubkey>,
    params: create::Params,
) -> Instruction {
    accounts.get_instruction(program_id, ProgramInstruction::Create as u8, params)
}
