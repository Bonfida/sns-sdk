import { useAsync } from "react-async-hook";
import { reverseLookup } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

const fn = async (
  connection: Connection,
  domain: PublicKey
): Promise<string> => {
  const reverse = await reverseLookup(connection, domain);
  return reverse;
};

/**
 * Returns the human readable name given the public key of domain
 * @param connection The Solana RPC connection object
 * @param pubkey The public key to look up
 * @returns The domain name
 */
export const useReverseLookup = (connection: Connection, pubkey: PublicKey) => {
  return useAsync(fn, [connection, pubkey]);
};
