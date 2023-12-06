import { useAsync } from "react-async-hook";
import { Connection, PublicKey } from "@solana/web3.js";
import { toDomainKey } from "../../utils/domain-to-key";
import { NameRegistryState } from "@bonfida/spl-name-service";

/**
 * Returns the size in kB of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The domain name (or its public key)
 * @returns The size in kB of `domain`
 */
export const useDomainSize = (
  connection: Connection,
  domain: string | PublicKey,
) => {
  const key = toDomainKey(domain);
  return useAsync(async () => {
    if (!key) return;
    const acc = await connection.getAccountInfo(key);
    if (!acc) return 0;
    return (acc.data.length - NameRegistryState.HEADER_LEN) / 1_000; // in kB;
  }, [key?.toBase58()]);
};
