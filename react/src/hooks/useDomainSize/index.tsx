import { useAsync } from "react-async-hook";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "../../utils/domain-to-key";
import { NameRegistryState } from "@bonfida/spl-name-service";

const fn = async (
  connection: Connection,
  domain: PublicKey
): Promise<number> => {
  const acc = await connection.getAccountInfo(domain);
  if (!acc) return 0;
  return (acc.data.length - NameRegistryState.HEADER_LEN) / 1_000; // in kB;
};

/**
 * Returns the size in kB of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The domain name (or its public key)
 * @returns The size in kB of `domain`
 */
export const useDomainSize = (
  connection: Connection,
  domain: string | PublicKey
) => {
  return useAsync(fn, [connection, toKey(domain)]);
};
