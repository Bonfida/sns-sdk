import { computed, MaybeRef, unref } from "vue";
import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "@/utils/pubkey";
import { useLoadingFactory } from "@/utils/use-loading-factory";

/**
 * Returns the favorite domain if it exists.
 * @param connection The Solana RPC connection object
 * @param owner The owner public key base58 encoded or as a `PublicKey` object
 * @returns The public key of the favorite domain and it's reverse (i.e human readable)
 * @example
 * const { result, isLoading } = useFavoriteDomain(connection, '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b);
 */
export const useFavoriteDomain = (
  connection: MaybeRef<Connection>,
  owner: MaybeRef<string | PublicKey | null | undefined>,
) => {
  return useLoadingFactory(
    async () => {
      const rawConnection = unref(connection);

      const key = toKey(unref(owner));

      if (!key || !rawConnection) return null;

      const res = await getFavoriteDomain(rawConnection, key);

      return { pubkey: res.domain, domain: res.reverse };
    },
    () => [unref(connection), unref(owner)],
  );
};
