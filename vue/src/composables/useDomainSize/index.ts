import { computed, MaybeRef, toRef } from "vue";
import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "@bonfida/spl-name-service";
import { toDomainKey } from "@/utils/domain-to-key";
import { useLoadingFactory } from '@/utils/use-loading-factory';

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
  connection: Connection | null | undefined,
  domain: MaybeRef<string | PublicKey>,
) => {
  const refDomain = toRef(domain);
  const key = computed(() => toDomainKey(refDomain.value));

  return useLoadingFactory(async () => {
    let size = null;
    if (!key.value && !connection) return size;

    const acc = await connection!.getAccountInfo(key.value!);

    if (!acc) return size = 0;

    return size = (acc.data.length - NameRegistryState.HEADER_LEN) / 1_000; // in kB;
  }, [key]);
};
