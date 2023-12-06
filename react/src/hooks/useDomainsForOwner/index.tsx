import { useAsync } from "react-async-hook";
import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "../../utils/pubkey";

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
) => {
  const key = toKey(owner);
  return useAsync(async () => {
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
  }, [key?.toBase58()]);
};
