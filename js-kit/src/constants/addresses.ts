import { Address } from "@solana/addresses";

export const SYSTEM_PROGRAM_ADDRESS =
  "11111111111111111111111111111111" as Address;

export const SYSVAR_RENT_ADDRESS =
  "SysvarRent111111111111111111111111111111111" as Address;

export const DEFAULT_ADDRESS = "11111111111111111111111111111111" as Address;

/** Address of the SPL Token program */
export const TOKEN_PROGRAM_ADDRESS =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address;

/**
 * The Solana Name Service program address
 */
export const NAME_PROGRAM_ADDRESS =
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX" as Address;

/**
 * The `.sol` TLD
 */
export const ROOT_DOMAIN_ACCOUNT =
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx" as Address;

/**
 * The SNS Registry program address
 */
export const REGISTRY_PROGRAM_ADDRESS =
  "jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR" as Address;

/**
 * The SNS Name Tokenizer program address
 */
export const NAME_TOKENIZER_ADDRESS =
  "nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk" as Address;

/**
 * The SNS Offers program address
 */
export const NAME_OFFERS_ADDRESS =
  "85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29" as Address;

/**
 * The SNS Records program address (SNS_RECORDS_ID)
 */
export const RECORDS_PROGRAM_ADDRESS =
  "HP3D4D1ZCmohQGFVms2SS4LCANgJyksBf5s1F77FuFjZ" as Address;

/**
 * The reverse look up class
 */
export const REVERSE_LOOKUP_CLASS =
  "33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z" as Address;

export const CENTRAL_STATE = REVERSE_LOOKUP_CLASS;

/**
 * The central state for domain records (CENTRAL_STATE_SNS_RECORDS)
 */
export const CENTRAL_STATE_DOMAIN_RECORDS =
  "2pMnqHvei2N5oDcVGCRdZx48gqti199wr5CsyTTafsbo" as Address;

/**
 * The `.twitter` TLD authority
 */
export const TWITTER_VERIFICATION_AUTHORITY =
  "FvPH7PrVrLGKPfqaf3xJodFTjZriqrAXXLTVWEorTFBi" as Address;

/**
 * The `.twitter` TLD
 */
export const TWITTER_ROOT_PARENT_REGISTRY_ADDRESS =
  "4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv" as Address;

export const VAULT_OWNER =
  "5D2zKog251d6KPCyFyLMt3KroWwXXPWSgTPyhV22K2gR" as Address;

export const USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address;

export const METAPLEX_PROGRAM_ADDRESS =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as Address;

export const WOLVES_COLLECTION_METADATA =
  "72aLKvXeV4aansAQtxKymeXDevT5ed6sCuz9iN62ugPT" as Address;

export const REFERRERS: Address[] = [
  "3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1" as Address, //Test wallet,
  "DM1jJCkZZEwY5tmWbgvKRxsDFzXCdbfrYCCH1CtwguEs" as Address, //4Everland
  "ADCp4QXFajHrhy4f43pD6GJFtQLkdBY2mjS9DfCk7tNW" as Address, //Bandit network
  "2XTgjw8yi1E3Etgj4CUyRD7Zk49gynH2U9gA5N2MY4NP" as Address, //Altoscan
  "5PwNeqQPiygQks9R17jUAodZQNuhvCqqkrxSaeNE8qTR" as Address, //Solscan
  "8kJqxAbqbPLGLMgB6FhLcnw2SiUEavx2aEGM3WQGhtJF" as Address, //Domain Labs
  "HemvJzwxvVpWBjPETpaseAH395WAxb2G73MeUfjVkK1u" as Address, //Solflare
  "7hMiiUtkH4StMPJxyAtvzXTUjecTniQ8czkCPusf5eSW" as Address, //Solnames
  "DGpjHo4yYA3NgHvhHTp3XfBFrESsx1DnhfTr8D881ZBM" as Address, //Brave
  "7vWSqSw1eCXZXXUubuHWssXELNQ8MLaDgAs2ErEfCKxn" as Address, //585.eth
  "5F6gcdzpw7wUjNEugdsD4aLJdEQ4Wt8d6E85vaQXZQSJ" as Address, //wdotsol
  "XEy9o73JBN2pEuN7aspe8mVLaWbL4ozjJs1tNRxx8bL" as Address, //GoDID
  "D5cLoAGjNTHKU1UGv2bYwbnyRoGTMe3sbpLtJW3fRq91" as Address, //SuiNS
  "FePcCmrr7vgjeFXcXtJHqShSXydaTrga2wfHRt9RrYvP" as Address, //Nansen
  "5D2zKog251d6KPCyFyLMt3KroWwXXPWSgTPyhV22K2gR" as Address, //SNS
  "452cMqDHe5cf1Z96HxUNaQjiLckhMiZdZ5abe7oQ2iRB" as Address, //Endless Domains
];
