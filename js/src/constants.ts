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
  new PublicKey("7vWSqSw1eCXZXXUubuHWssXELNQ8MLaDgAs2ErEfCKxn"), // 585.eth
  new PublicKey("5F6gcdzpw7wUjNEugdsD4aLJdEQ4Wt8d6E85vaQXZQSJ"), // wdotsol
  new PublicKey("XEy9o73JBN2pEuN7aspe8mVLaWbL4ozjJs1tNRxx8bL"), // GoDID
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

export const DEFAULT_PYTH_PUSH_PROGRAM = new PublicKey(
  "pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT",
);

export const PYTH_PULL_FEEDS = new Map<string, number[]>([
  [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    [
      234, 160, 32, 198, 28, 196, 121, 113, 40, 19, 70, 28, 225, 83, 137, 74,
      150, 166, 192, 11, 33, 237, 12, 252, 39, 152, 209, 249, 169, 233, 201, 74,
    ],
  ],
  [
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    [
      43, 137, 185, 220, 143, 223, 159, 52, 112, 154, 91, 16, 107, 71, 47, 15,
      57, 187, 108, 169, 206, 4, 176, 253, 127, 46, 151, 22, 136, 226, 229, 59,
    ],
  ],
  [
    "So11111111111111111111111111111111111111112",
    [
      239, 13, 139, 111, 218, 44, 235, 164, 29, 161, 93, 64, 149, 209, 218, 57,
      42, 13, 47, 142, 208, 198, 199, 188, 15, 76, 250, 200, 194, 128, 181, 109,
    ],
  ],
  [
    "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
    [
      200, 6, 87, 183, 246, 243, 234, 194, 114, 24, 208, 157, 90, 78, 84, 228,
      123, 37, 118, 141, 159, 94, 16, 172, 21, 254, 44, 249, 0, 136, 20, 0,
    ],
  ],
  [
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    [
      194, 40, 154, 106, 67, 210, 206, 145, 198, 245, 92, 174, 195, 112, 244,
      172, 195, 138, 46, 212, 119, 245, 136, 19, 51, 76, 109, 3, 116, 159, 242,
      164,
    ],
  ],
  [
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    [
      114, 176, 33, 33, 124, 163, 254, 104, 146, 42, 25, 170, 249, 144, 16, 156,
      185, 216, 78, 154, 208, 4, 180, 210, 2, 90, 214, 245, 41, 49, 68, 25,
    ],
  ],
  [
    "EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz",
    [
      142, 134, 15, 183, 78, 96, 229, 115, 107, 69, 93, 130, 246, 11, 55, 40, 4,
      156, 52, 142, 148, 150, 26, 221, 95, 150, 27, 2, 253, 238, 37, 53,
    ],
  ],
  [
    "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    [
      11, 191, 40, 233, 168, 65, 161, 204, 120, 143, 106, 54, 27, 23, 202, 7,
      45, 14, 163, 9, 138, 30, 93, 241, 195, 146, 45, 6, 113, 149, 121, 255,
    ],
  ],
  [
    "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
    [
      137, 135, 83, 121, 231, 15, 143, 186, 220, 23, 174, 243, 21, 173, 243,
      168, 213, 209, 96, 184, 17, 67, 85, 55, 224, 60, 151, 232, 170, 201, 125,
      156,
    ],
  ],
  [
    "6McPRfPV6bY1e9hLxWyG54W9i9Epq75QBvXg2oetBVTB",
    [
      122, 91, 193, 210, 181, 106, 208, 41, 4, 140, 214, 57, 100, 179, 173, 39,
      118, 234, 223, 129, 46, 220, 26, 67, 163, 20, 6, 203, 84, 191, 245, 146,
    ],
  ],
]);
