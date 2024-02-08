import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "../../utils/pubkey";
import { useQuery } from "@tanstack/react-query";
import { Options } from "../../types";

type Result = { pubkey: PublicKey; domain: string }[];

/**
 * Returns all the domains for the specified owner
 * @param connection The Solana RPC connection object
 * @param owner The owner public key base58 encoded or as a `PublicKey` object
 * @returns The list of domain names owned by `owner`
 */
export const useDomainsForOwner = (
  connection: Connection,
  owner: string | PublicKey | null | undefined,
  options: Options<Result | undefined> = {
    queryKey: ["useDomainsForOwner", owner],
  },
) => {
  const key = toKey(owner);
  return useQuery({
    ...options,
    queryFn: async () => {
      if (!key) return;
      const domains = await getAllDomains(connection, key);
      const reverses = await reverseLookupBatch(connection, domains);
      const result = domains
        .map((e, idx) => {
          return { pubkey: e, domain: reverses[idx] };
        })
        .filter((e) => !!e.domain)
        .sort((a, b) =>
          (a.domain as string).localeCompare(b.domain as string),
        ) as Result;
      return result;
    },
  });
};
