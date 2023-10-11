export const tokenList = [
  {
    decimals: 6,
    tokenSymbol: "USDC",
    mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    tokenName: "USD Coin",
    pythFeed: "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    decimals: 9,
    tokenSymbol: "SOL",
    mintAddress: "So11111111111111111111111111111111111111112",
    pythFeed: "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
    tokenName: "Wrapped SOL",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    decimals: 6,
    tokenSymbol: "FIDA",
    mintAddress: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
    tokenName: "Bonfida Token",
    pythFeed: "ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp/logo.svg",
  },
  {
    decimals: 6,
    tokenSymbol: "USDT",
    mintAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    tokenName: "USDT",
    pythFeed: "3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/D3KdBta3p53RV5FoahnJM5tP45h6Fd3AyFYgXTJvGCaK/logo.svg",
  },
  {
    decimals: 9,
    tokenSymbol: "mSOL",
    mintAddress: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    tokenName: "mSOL",
    pythFeed: "E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
  },

  {
    decimals: 5,
    tokenSymbol: "BONK",
    mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenName: "BONK",
    pythFeed: "8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN",
    icon: "https://solana.fm/api/image-proxy?imageUrl=https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
  },

  {
    decimals: 8,
    tokenSymbol: "BAT",
    mintAddress: "EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz",
    tokenName: "BAT",
    pythFeed: "AbMTYZ82Xfv9PtTQ5e1fJXemXjzqEEFHP3oDLRTae6yz",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz/logo.png",
  },
];

export const tokenIconBySymbol = (symbol: string) =>
  tokenList.find((item) => item.tokenSymbol === symbol)?.icon;

export const FIDA_MINT = "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp";
