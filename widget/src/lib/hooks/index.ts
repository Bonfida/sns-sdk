import { Connection } from "@solana/web3.js";

export function useSolanaConnection() {
  return new Connection("https://helius-proxy.bonfida.com", "processed");
}
