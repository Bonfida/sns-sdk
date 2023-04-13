import { PublicKey } from "@solana/web3.js";

/**
 * The Solana Name Service program ID
 */
export const NAME_PROGRAM_ID = new PublicKey(
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"
);

/**
 * Hash prefix used to derive domain name addresses
 */
export const HASH_PREFIX = "SPL Name Service";

/**
 * The `.sol` TLD
 */
export const ROOT_DOMAIN_ACCOUNT = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);

/**
 * The Registry program ID
 */
export const REGISTER_PROGRAM_ID = new PublicKey(
  "jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR"
);

/**
 * The FIDA Pyth price feed
 */
export const PYTH_FIDA_PRICE_ACC = new PublicKey(
  "ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF"
);

/**
 * The FIDA buy and burn address
 */
export const BONFIDA_FIDA_BNB = new PublicKey(
  "AUoZ3YAhV3b2rZeEH93UMZHXUZcTramBvb4d9YEVySkc"
);

/**
 * The reverse look up class
 */
export const REVERSE_LOOKUP_CLASS = new PublicKey(
  "33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z"
);

/**
 * The `.twitter` TLD authority
 */
export const TWITTER_VERIFICATION_AUTHORITY = new PublicKey(
  "FvPH7PrVrLGKPfqaf3xJodFTjZriqrAXXLTVWEorTFBi"
);

/**
 * The `.twitter` TLD
 */
export const TWITTER_ROOT_PARENT_REGISTRY_KEY = new PublicKey(
  "4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv"
);

/**
 * The length of the SOL record signature
 */
export const SOL_RECORD_SIG_LEN = 96;

export const BONFIDA_USDC_BNB = new PublicKey(
  "DmSyHDSM9eSLyvoLsPvDr5fRRFZ7Bfr3h3ULvWpgQaq7"
);

export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const REFERRERS: PublicKey[] = [];

export const TOKENS_SYM_MINT = new Map<string, string>([
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC"],
  ["Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "USDT"],
  ["So11111111111111111111111111111111111111112", "SOL"],
  ["EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp", "FIDA"],
  ["FeGn77dhg1KXRRFeSwwMiykZnZPw5JXW6naf2aQgZDQf", "ETH"],
  ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "MSOL"],
]);

export const PYTH_MAPPING_ACC = new PublicKey(
  "AHtgzX45WTKfkPG53L6WYhGEXwQkN1BVknET3sVsLL8J"
);

export const VAULT_OWNER = new PublicKey(
  "GcWEQ9K78FV7LEHteFVciYApERk5YvQuFDQPk1yYJVXi"
);
