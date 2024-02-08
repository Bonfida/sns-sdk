import { useQuery } from "@tanstack/react-query";
import { resolve } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { Options } from "../../types";

const fn = async (
  connection: Connection,
  domain: string | null | undefined,
): Promise<PublicKey | undefined> => {
  if (!domain) return;
  const owner = await resolve(connection, domain);
  return owner;
};

/**
 * Returns the `PublicKey` of the owner of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The domain name to resolve
 * @returns The `PublicKey` of the current owner of `domain`
 */
export const useDomainOwner = (
  connection: Connection,
  domain: string | null | undefined,
  options: Options<PublicKey | undefined> = {
    queryKey: ["useDomainOwner", domain],
  },
) => {
  return useQuery({ ...options, queryFn: async () => fn(connection, domain) });
};
