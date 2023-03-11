import { useAsync } from "react-async-hook";
import { findSubdomains } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "../../utils/domain-to-key";

/**
 * Returns the list of all sudomains for a given parent
 * @param connection The Solana RPC connection object
 * @param domain The parent domain name (or its public key)
 * @returns The list of sub-domains of `domain`
 */
export const useSubdomains = (
  connection: Connection,
  domain: string | PublicKey
) => {
  const key = toKey(domain);
  return useAsync(async () => {
    const subs = await findSubdomains(connection, key);
    return subs;
  }, [key.toBase58()]);
};
