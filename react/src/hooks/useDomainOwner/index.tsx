import { useAsync } from "react-async-hook";
import { resolve } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

const fn = async (
  connection: Connection,
  domain: string
): Promise<PublicKey> => {
  const owner = await resolve(connection, domain);
  return owner;
};

/**
 * Returns the `PublicKey` of the owner of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The domain name to resolve
 * @returns The `PublicKey` of the current owner of `domain`
 */
export const useDomainOwner = (connection: Connection, domain: string) => {
  return useAsync(fn, [connection, domain]);
};
