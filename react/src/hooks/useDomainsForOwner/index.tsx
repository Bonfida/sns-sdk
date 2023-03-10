import { useAsync } from "react-async-hook";
import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

type Result = { pubkey: PublicKey; domain: string }[];

const fn = async (
  connection: Connection,
  owner: PublicKey
): Promise<Result> => {
  const domains = await getAllDomains(connection, owner);
  const reverses = await reverseLookupBatch(connection, domains);
  const result = domains
    .map((e, idx) => {
      return { pubkey: e, domain: reverses[idx] };
    })
    .filter((e) => !!e.domain) as Result;
  return result;
};

/**
 * Returns all the domains for the specified owner
 * @param connection The Solana RPC connection object
 * @param owner The owner public key base58 encoded or as a `PublicKey` object
 * @returns The list of domain names owned by `owner`
 */
export const useDomainsForOwner = (
  connection: Connection,
  owner: string | PublicKey
) => {
  const key = typeof owner === "string" ? new PublicKey(owner) : owner;
  return useAsync(fn, [connection, key]);
};
