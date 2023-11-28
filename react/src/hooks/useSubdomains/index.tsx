import { useAsync } from "react-async-hook";
import { findSubdomains } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toDomainKey } from "../../utils/domain-to-key";

/**
 * Returns the list of all sudomains for a given parent
 * @param connection The Solana RPC connection object
 * @param domain The parent domain name (or its public key)
 * @returns The list of sub-domains of `domain`
 */
export const useSubdomains = (
  connection: Connection,
  domain: string | PublicKey | undefined | null,
) => {
  const key = toDomainKey(domain);
  return useAsync(async () => {
    if (!key) return;
    const subs = await findSubdomains(connection, key);
    return subs;
  }, [key?.toBase58()]);
};
