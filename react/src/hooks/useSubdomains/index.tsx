import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";
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
  options: Options<string[] | undefined> = {
    queryKey: ["useSubdomains", domain],
  },
) => {
  const key = toDomainKey(domain);
  return useQuery({
    ...options,
    queryFn: async () => {
      if (!key) return;
      const subs = await findSubdomains(connection, key);
      return subs;
    },
  });
};
