import { unref, computed, MaybeRef, toRef } from "vue";
import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "@bonfida/spl-name-service";
import { toDomainKey } from "@/utils/domain-to-key";
import { useLoadingFactory } from "@/utils/use-loading-factory";

/**
 * Returns the size in kB of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The domain name (or its public key)
 * @returns The size in kB of `domain`
 * @example
 * const { result: size1 } = useDomainSize(connection, 'domain');
 * console.log(size1.value) // 10
 *
 * const { result: size2 } = useDomainSize(connection, '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b');
 * console.log(size2.value) // 10
 */
export const useDomainSize = (
  connection: MaybeRef<Connection | null | undefined>,
  domain: MaybeRef<string | PublicKey>,
) => {
  return useLoadingFactory(
    async () => {
      const rawConnection = unref(connection);
      const key = toDomainKey(unref(domain));

      if (!key || !rawConnection) return null;

      const acc = await rawConnection!.getAccountInfo(key);

      if (!acc) return 0;

      return (acc.data.length - NameRegistryState.HEADER_LEN) / 1_000; // in kB;
    },
    () => [unref(connection), unref(domain)],
  );
};
