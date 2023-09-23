package constants

import "github.com/gagliardetto/solana-go"

/**
 * The Solana Name Service program ID
 */
var NAME_PROGRAM_ID = solana.MustPublicKeyFromBase58("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX")

/**
 * Hash prefix used to derive domain name addresses
 */
var HASH_PREFIX = "SPL Name Service"

/**
 * The `.sol` TLD
 */
var ROOT_DOMAIN_ACCOUNT = solana.MustPublicKeyFromBase58("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx")

/**
 * The Registry program ID
 */
var REGISTER_PROGRAM_ID = solana.MustPublicKeyFromBase58("jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR")

/**
 * The FIDA Pyth price feed
 */
var PYTH_FIDA_PRICE_ACC = solana.MustPublicKeyFromBase58("ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF")

/**
 * The FIDA buy and burn address
 */
var BONFIDA_FIDA_BNB = solana.MustPublicKeyFromBase58("AUoZ3YAhV3b2rZeEH93UMZHXUZcTramBvb4d9YEVySkc")

/**
 * The reverse look up class
 */
var REVERSE_LOOKUP_CLASS = solana.MustPublicKeyFromBase58("33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z")

/**
 * The `.twitter` TLD authority
 */
var TWITTER_VERIFICATION_AUTHORITY = solana.MustPublicKeyFromBase58("FvPH7PrVrLGKPfqaf3xJodFTjZriqrAXXLTVWEorTFBi")

/**
 * The `.twitter` TLD
 */
var TWITTER_ROOT_PARENT_REGISTRY_KEY = solana.MustPublicKeyFromBase58("4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv")

/**
 * The length of the SOL record signature
 */
var SOL_RECORD_SIG_LEN = 96

var BONFIDA_USDC_BNB = solana.MustPublicKeyFromBase58("DmSyHDSM9eSLyvoLsPvDr5fRRFZ7Bfr3h3ULvWpgQaq7")

var USDC_MINT = solana.MustPublicKeyFromBase58("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")

var test_wallet = solana.MustPublicKeyFromBase58("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1")    // Test wallet,
var everland = solana.MustPublicKeyFromBase58("DM1jJCkZZEwY5tmWbgvKRxsDFzXCdbfrYCCH1CtwguEs")       // 4Everland
var bandit_network = solana.MustPublicKeyFromBase58("ADCp4QXFajHrhy4f43pD6GJFtQLkdBY2mjS9DfCk7tNW") // Bandit network
var altoscan = solana.MustPublicKeyFromBase58("2XTgjw8yi1E3Etgj4CUyRD7Zk49gynH2U9gA5N2MY4NP")       // Altoscan

var REFERRERS = []solana.PublicKey{
	test_wallet,
	everland,
	bandit_network,
	altoscan,
}

var TOKENS_SYM_MINT = map[string]string{
	"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
	"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
	"So11111111111111111111111111111111111111112":  "SOL",
	"EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp": "FIDA",
	"FeGn77dhg1KXRRFeSwwMiykZnZPw5JXW6naf2aQgZDQf": "ETH",
	"7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx": "GMT",
	"AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB": "GST",
	"mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So":  "MSOL",
	"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": "BONK",
	"EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz": "BAT",
}

var PYTH_MAPPING_ACC = solana.MustPublicKeyFromBase58("AHtgzX45WTKfkPG53L6WYhGEXwQkN1BVknET3sVsLL8J")

var VAULT_OWNER = solana.MustPublicKeyFromBase58("GcWEQ9K78FV7LEHteFVciYApERk5YvQuFDQPk1yYJVXi")
