import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "../../utils/pubkey";

type FavoriteDomainResult =
  | { pubkey: PublicKey; domain: string; stale: boolean }
  | undefined;

/**
 * Returns the favorite domain if it exists.
 * @param connection The Solana RPC connection object
 * @param owner The owner public key base58 encoded or as a `PublicKey` object
 * @returns The public key of the favorite domain and it's reverse (i.e human readable)
 */
export const useFavoriteDomain = (
  connection: Connection,
  owner: string | PublicKey | null | undefined,
  options: Options<FavoriteDomainResult> = {
    queryKey: ["useFavoriteDomain", owner],
  },
) => {
  const key = toKey(owner);

  const fn = async (): Promise<FavoriteDomainResult> => {
    if (!key) return;
    try {
      const res = await getFavoriteDomain(connection, key);
      return { pubkey: res.domain, domain: res.reverse, stale: res.stale };
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  return useQuery({
    ...options,
    queryFn: fn,
  });
};
