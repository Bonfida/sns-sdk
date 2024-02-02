import { PublicKey } from "@solana/web3.js";

/**
 * The Solana Name Service program ID
 */
export const NAME_PROGRAM_ID = new PublicKey(
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",
);

/**
 * Hash prefix used to derive domain name addresses
 */
export const HASH_PREFIX = "SPL Name Service";

/**
 * The `.sol` TLD
 */
export const ROOT_DOMAIN_ACCOUNT = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx",
);

/**
 * The Registry program ID
 */
export const REGISTER_PROGRAM_ID = new PublicKey(
  "jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR",
);

/**
 * The FIDA Pyth price feed
 */
export const PYTH_FIDA_PRICE_ACC = new PublicKey(
  "ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF",
);

/**
 * The FIDA buy and burn address
 */
export const BONFIDA_FIDA_BNB = new PublicKey(
  "AUoZ3YAhV3b2rZeEH93UMZHXUZcTramBvb4d9YEVySkc",
);

/**
 * The reverse look up class
 */
export const REVERSE_LOOKUP_CLASS = new PublicKey(
  "33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z",
);

/**
 * The `.twitter` TLD authority
 */
export const TWITTER_VERIFICATION_AUTHORITY = new PublicKey(
  "FvPH7PrVrLGKPfqaf3xJodFTjZriqrAXXLTVWEorTFBi",
);

/**
 * The `.twitter` TLD
 */
export const TWITTER_ROOT_PARENT_REGISTRY_KEY = new PublicKey(
  "4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv",
);

/**
 * The length of the SOL record signature
 */
export const SOL_RECORD_SIG_LEN = 96;

export const BONFIDA_USDC_BNB = new PublicKey(
  "DmSyHDSM9eSLyvoLsPvDr5fRRFZ7Bfr3h3ULvWpgQaq7",
);

export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
);

export const REFERRERS: PublicKey[] = [
  new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1"), // Test wallet,
  new PublicKey("DM1jJCkZZEwY5tmWbgvKRxsDFzXCdbfrYCCH1CtwguEs"), // 4Everland
  new PublicKey("ADCp4QXFajHrhy4f43pD6GJFtQLkdBY2mjS9DfCk7tNW"), // Bandit network
  new PublicKey("2XTgjw8yi1E3Etgj4CUyRD7Zk49gynH2U9gA5N2MY4NP"), // Altoscan
  new PublicKey("5PwNeqQPiygQks9R17jUAodZQNuhvCqqkrxSaeNE8qTR"), // Solscan
  new PublicKey("8kJqxAbqbPLGLMgB6FhLcnw2SiUEavx2aEGM3WQGhtJF"), // Domain Labs
  new PublicKey("HemvJzwxvVpWBjPETpaseAH395WAxb2G73MeUfjVkK1u"), // Solflare
  new PublicKey("7hMiiUtkH4StMPJxyAtvzXTUjecTniQ8czkCPusf5eSW"), // Solnames
  new PublicKey("DGpjHo4yYA3NgHvhHTp3XfBFrESsx1DnhfTr8D881ZBM"), // Brave
];

export const TOKENS_SYM_MINT = new Map<string, string>([
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC"],
  ["Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "USDT"],
  ["So11111111111111111111111111111111111111112", "SOL"],
  ["EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp", "FIDA"],
  ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "MSOL"],
  ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", "BONK"],
  ["EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz", "BAT"],
  ["HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", "PYTH"],
  ["bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1", "BSOL"],
  ["6McPRfPV6bY1e9hLxWyG54W9i9Epq75QBvXg2oetBVTB", "INJ"],
]);

export const PYTH_FEEDS = new Map<string, { price: string; product: string }>([
  [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    {
      price: "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
      product: "8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb",
    },
  ],
  [
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    {
      price: "3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL",
      product: "Av6XyAMJnyi68FdsKSPYgzfXGjYrrt6jcAMwtvzLCqaM",
    },
  ],
  [
    "So11111111111111111111111111111111111111112",
    {
      price: "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
      product: "ALP8SdU9oARYVLgLR7LrqMNCYBnhtnQz1cj6bwgwQmgj",
    },
  ],
  [
    "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
    {
      price: "ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF",
      product: "HyEB4Goiv7QyfFStaBn49JqQzSTV1ybtVikwsMLH1f2M",
    },
  ],
  [
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    {
      price: "E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9",
      product: "BS2iAqT67j8hA9Jji4B8UpL3Nfw9kwPfU5s4qeaf1e7r",
    },
  ],
  [
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    {
      price: "8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN",
      product: "FerFD54J6RgmQVCR5oNgpzXmz8BW2eBNhhirb1d5oifo",
    },
  ],
  [
    "EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz",
    {
      price: "AbMTYZ82Xfv9PtTQ5e1fJXemXjzqEEFHP3oDLRTae6yz",
      product: "8xTEctXKo6Xo3EzNhSNp4TUe8mgfwWFbDUXJhuubvrKx",
    },
  ],
  [
    "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    {
      price: "nrYkQQQur7z8rYTST3G9GqATviK5SxTDkrqd21MW6Ue",
      product: "AiQB4WngNPKDe3iWAwZmMzbULDAAfUD6Sr1knfZNJj3y",
    },
  ],
  [
    "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
    {
      price: "AFrYBhb5wKQtxRS9UA9YRS4V3dwFm7SqmS6DHKq6YVgo",
      product: "3RtUHQR2LQ7su5R4zWwjupx72sWRGvLA4cFmnbHnT9M7",
    },
  ],
  [
    "6McPRfPV6bY1e9hLxWyG54W9i9Epq75QBvXg2oetBVTB",
    {
      price: "9EdtbaivHQYA4Nh3XzGR6DwRaoorqXYnmpfsnFhvwuVj",
      product: "5Q5kyCVzssrGMd2BniSdVeRwjNWrGGrFhMrgGt4zURyA",
    },
  ],
]);

export const PYTH_MAPPING_ACC = new PublicKey(
  "AHtgzX45WTKfkPG53L6WYhGEXwQkN1BVknET3sVsLL8J",
);

export const VAULT_OWNER_DEPRECATED = new PublicKey(
  "GcWEQ9K78FV7LEHteFVciYApERk5YvQuFDQPk1yYJVXi",
);

export const VAULT_OWNER = new PublicKey(
  "5D2zKog251d6KPCyFyLMt3KroWwXXPWSgTPyhV22K2gR",
);

export const CUSTOM_BG_TLD = new PublicKey(
  "BPeXUQDqGbzxeK1LJby6ugvCBuo7kRSEUkjD726mUVsz",
);

export const WOLVES_COLLECTION_METADATA = new PublicKey(
  "72aLKvXeV4aansAQtxKymeXDevT5ed6sCuz9iN62ugPT",
);

export const METAPLEX_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);
