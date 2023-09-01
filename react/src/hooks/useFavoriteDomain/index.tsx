import { useAsync } from "react-async-hook";
import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "../../utils/pubkey";

/**
 * Returns the favorite domain if it exists.
 * @param connection The Solana RPC connection object
 * @param owner The owner public key base58 encoded or as a `PublicKey` object
 * @returns The public key of the favorite domain and it's reverse (i.e human readable)
 */
export const useFavoriteDomain = (
  connection: Connection,
  owner: string | PublicKey | null | undefined
) => {
  const key = toKey(owner);
  return useAsync(async () => {
    if (!key) return;
    try {
      const res = await getFavoriteDomain(connection, key);
      return { pubkey: res.domain, domain: res.reverse };
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }, [key?.toBase58()]);
};
