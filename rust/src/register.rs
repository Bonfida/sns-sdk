use bonfida_utils::InstructionsAccount;
use solana_program::{instruction::Instruction, pubkey};
use solana_sdk::pubkey::Pubkey;

pub use constants::*;

#[cfg(not(feature = "devnet"))]
mod constants {
    use super::*;

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
    pub const MSOL_MINT: Pubkey = pubkey!("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
    pub const BONK_MINT: Pubkey = pubkey!("6dhTynDkYsVM7cbF7TKfC9DWB636TcEM935fq7JzL2ES");
    pub const BAT_MINT: Pubkey = pubkey!("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
    pub const PYTH_PROGRAM_ID: Pubkey = pubkey!("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
    pub const PYTH_MAPPING_ACC: Pubkey = pubkey!("AHtgzX45WTKfkPG53L6WYhGEXwQkN1BVknET3sVsLL8J");

    pub const PYTH_PRICE_PRODUCT_ACCOUNTS: [(Pubkey, Pubkey, Pubkey); 7] = [
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
        (
            MSOL_MINT,
            pubkey!("E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9"),
            pubkey!("BS2iAqT67j8hA9Jji4B8UpL3Nfw9kwPfU5s4qeaf1e7r"),
        ),
        (
            BONK_MINT,
            pubkey!("8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN"),
            pubkey!("FerFD54J6RgmQVCR5oNgpzXmz8BW2eBNhhirb1d5oifo"),
        ),
        (
            BONK_MINT,
            pubkey!("AbMTYZ82Xfv9PtTQ5e1fJXemXjzqEEFHP3oDLRTae6yz"),
            pubkey!("8xTEctXKo6Xo3EzNhSNp4TUe8mgfwWFbDUXJhuubvrKx"),
        ),
    ];

    pub const VAULT_OWNER: Pubkey = pubkey!("GcWEQ9K78FV7LEHteFVciYApERk5YvQuFDQPk1yYJVXi");
}

#[cfg(feature = "devnet")]
mod constants {
    use super::*;

    pub const REGISTER_PROGRAM_ID: Pubkey = pubkey!("snshBoEQ9jx4QoHBpZDQPYdNCtw7RMxJvYrKFEhwaPJ");

    pub const REFERRERS: [Pubkey; 3] = [
        pubkey!("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1"), // Test wallet
        pubkey!("DM1jJCkZZEwY5tmWbgvKRxsDFzXCdbfrYCCH1CtwguEs"), // 4Everland
        pubkey!("ADCp4QXFajHrhy4f43pD6GJFtQLkdBY2mjS9DfCk7tNW"), // Bandit network
    ];

    pub const USDC_MINT: Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
    pub const USDT_MINT: Pubkey = pubkey!("EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS");
    pub const SOL_MINT: Pubkey = pubkey!("So11111111111111111111111111111111111111112");
    pub const FIDA_MINT: Pubkey = pubkey!("fidaWCioBQjieRrUQDxxS5Uxmq1CLi2VuVRyv4dEBey");
    pub const INJ_MINT: Pubkey = pubkey!("DL4ivZm3NVHWk9ZvtcqTchxoKArDK4rT3vbDx2gYVr7P");
    // pub const MSOL_MINT: Pubkey = pubkey!("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
    pub const PYTH_PROGRAM_ID: Pubkey = pubkey!("gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s");
    pub const PYTH_MAPPING_ACC: Pubkey = pubkey!("BmA9Z6FjioHJPpjT39QazZyhDRUdZy2ezwx4GiDdE2u2");

    pub const PYTH_PRICE_PRODUCT_ACCOUNTS: [(Pubkey, Pubkey, Pubkey); 5] = [
        (
            USDC_MINT,
            pubkey!("5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7"),
            pubkey!("6NpdXrQEpmDZ3jZKmM2rhdmkd3H6QAk23j2x8bkXcHKA"),
        ),
        (
            USDT_MINT,
            pubkey!("38xoQ4oeJCBrcVvca2cGk7iV1dAfrmTR1kmhSCJQ8Jto"),
            pubkey!("C5wDxND9E61RZ1wZhaSTWkoA8udumaHnoQY6BBsiaVpn"),
        ),
        (
            SOL_MINT,
            pubkey!("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
            pubkey!("3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E"),
        ),
        (
            FIDA_MINT,
            pubkey!("7teETxN9Y8VK6uJxsctHEwST75mKLLwPH1jaFdvTQCpD"),
            pubkey!("5kWV4bhHeZANzg5MWaYCQYEEKHjur5uz1mu5vuLHwiLB"),
        ),
        (
            INJ_MINT,
            pubkey!("44uRsNnT35kjkscSu59MxRr9CfkLZWf6gny8bWqUbVxE"),
            pubkey!("7UHB783Nh4avW3Yw9yoktf2KjxipU56KPahA51RnCCYE"),
        ),
    ];

    pub const VAULT_OWNER: Pubkey = pubkey!("SNSaTJbEv2iT3CUrCQYa9zpGjbBVWhFCPaSJHkaJX34");
}

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
