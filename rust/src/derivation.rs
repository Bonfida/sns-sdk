use {
    solana_program::{hash::hashv, pubkey, pubkey::Pubkey},
    spl_name_service::state::{get_seeds_and_key, HASH_PREFIX},
};

use crate::error::SnsError;

pub use constants::*;
#[cfg(not(feature = "devnet"))]
mod constants {
    use super::*;

    pub const ROOT_DOMAIN_ACCOUNT: Pubkey = pubkey!("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx");
    pub const REVERSE_LOOKUP_CLASS: Pubkey =
        pubkey!("33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z");

    pub const MINT_PREFIX: &[u8; 14] = b"tokenized_name";
    pub const NAME_TOKENIZER_ID: Pubkey = pubkey!("nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk");
}
#[cfg(feature = "devnet")]
mod constants {
    use super::*;

    pub const ROOT_DOMAIN_ACCOUNT: Pubkey = pubkey!("5eoDkP6vCQBXqDV9YN2NdUs3nmML3dMRNmEYpiyVNBm2");
    pub const REVERSE_LOOKUP_CLASS: Pubkey =
        pubkey!("7NbD1vprif6apthEZAqhRfYuhrqnuderB8qpnfXGCc8H");

    pub const MINT_PREFIX: &[u8; 14] = b"tokenized_name";
    // TODO
    pub const NAME_TOKENIZER_ID: Pubkey = pubkey!("nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk");
}

#[derive(Copy, Clone, Debug)]
pub enum Domain {
    Main,
    Sub,
    Record,
}

pub fn get_prefix(domain: Domain) -> String {
    match domain {
        Domain::Main => "".to_string(),
        Domain::Sub => "\0".to_string(),
        Domain::Record => "\x01".to_string(),
    }
}

pub fn get_hashed_name(name: &str) -> Vec<u8> {
    hashv(&[(HASH_PREFIX.to_owned() + name).as_bytes()])
        .as_ref()
        .to_vec()
}

pub fn derive(domain: &str, parent: &Pubkey) -> Pubkey {
    let hashed_name = get_hashed_name(domain);
    let (key, _) = get_seeds_and_key(&spl_name_service::ID, hashed_name, None, Some(parent));
    key
}

pub fn get_domain_key(domain: &str, record: bool) -> Result<Pubkey, SnsError> {
    let domain = domain.strip_suffix(".sol").unwrap_or(domain);
    let splitted = domain.split('.').collect::<Vec<_>>();
    match (splitted.len(), record) {
        (1, _) => {
            let key = derive(domain, &ROOT_DOMAIN_ACCOUNT);
            Ok(key)
        }
        (2, _) => {
            let parent = derive(splitted[1], &ROOT_DOMAIN_ACCOUNT);
            let sub_domain =
                get_prefix(if record { Domain::Record } else { Domain::Sub }) + splitted[0];
            let key = derive(&sub_domain, &parent);
            Ok(key)
        }
        (3, true) => {
            let parent = derive(splitted[2], &ROOT_DOMAIN_ACCOUNT);
            let sub_domain = get_prefix(Domain::Sub) + splitted[1];
            let sub_key = derive(&sub_domain, &parent);
            let record = get_prefix(Domain::Record) + splitted[0];
            let key = derive(&record, &sub_key);
            Ok(key)
        }
        _ => Err(SnsError::InvalidDomain),
    }
}

pub fn get_reverse_key(domain: &str) -> Result<Pubkey, SnsError> {
    let domain = domain.strip_suffix(".sol").unwrap_or(domain);
    let splitted = domain.split('.').collect::<Vec<_>>();
    match splitted.len() {
        1 => {
            let domain_key = get_domain_key(domain, false)?;
            let hashed = get_hashed_name(&domain_key.to_string());
            let (key, _) = get_seeds_and_key(
                &spl_name_service::ID,
                hashed,
                Some(&REVERSE_LOOKUP_CLASS),
                None,
            );
            Ok(key)
        }
        2 => {
            let parent_key = get_domain_key(splitted[1], false)?;
            let domain_key = get_domain_key(domain, false)?;
            let hashed = get_hashed_name(&domain_key.to_string());
            let (key, _) = get_seeds_and_key(
                &spl_name_service::ID,
                hashed,
                Some(&REVERSE_LOOKUP_CLASS),
                Some(&parent_key),
            );
            Ok(key)
        }
        _ => Err(SnsError::InvalidDomain),
    }
}

pub fn get_domain_mint(domain_key: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[MINT_PREFIX, &domain_key.to_bytes()], &NAME_TOKENIZER_ID).0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn main_domain() {
        let result = get_domain_key("bonfida", false).unwrap();
        let expected: Pubkey = pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");
        assert_eq!(result, expected);
        let result = get_domain_key("bonfida.sol", false).unwrap();
        let expected: Pubkey = pubkey!("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");
        assert_eq!(result, expected);
    }
    #[test]
    fn sub_domain() {
        let result = get_domain_key("dex.bonfida", false).unwrap();
        let expected: Pubkey = pubkey!("HoFfFXqFHAC8RP3duuQNzag1ieUwJRBv1HtRNiWFq4Qu");
        assert_eq!(result, expected);
        let result = get_domain_key("dex.bonfida.sol", false).unwrap();
        let expected: Pubkey = pubkey!("HoFfFXqFHAC8RP3duuQNzag1ieUwJRBv1HtRNiWFq4Qu");
        assert_eq!(result, expected);
    }
}
