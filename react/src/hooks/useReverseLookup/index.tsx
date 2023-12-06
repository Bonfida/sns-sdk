import { useAsync } from "react-async-hook";
import { reverseLookup } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Returns the human readable name given the public key of domain
 * @param connection The Solana RPC connection object
 * @param pubkey The public key to look up
 * @returns The domain name
 */
export const useReverseLookup = (
  connection: Connection,
  pubkey: PublicKey | null | undefined,
) => {
  return useAsync(async () => {
    if (!pubkey) return;
    const reverse = await reverseLookup(connection, pubkey);
    return reverse;
  }, [pubkey?.toBase58()]);
};
