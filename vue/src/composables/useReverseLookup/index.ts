import { MaybeRef, unref } from "vue";
import { reverseLookup } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { useLoadingFactory } from "@/utils/use-loading-factory";

/**
 * Returns the human readable name given the public key of domain
 * @param connection The Solana RPC connection object
 * @param pubkey The public key to look up
 * @returns The domain name
 * @example
 * const { result } = useReverseLookup(connection, new PublicKey('9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b'));
 */
export const useReverseLookup = (
  connection: MaybeRef<Connection>,
  pubkey: MaybeRef<PublicKey | null | undefined>,
) => {
  return useLoadingFactory(
    async () => {
      const key = unref(pubkey);

      if (!key) return null;

      return reverseLookup(unref(connection), key);
    },
    () => [unref(connection), unref(pubkey)],
  );
};
