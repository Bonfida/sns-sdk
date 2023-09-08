import { toRef, Ref, MaybeRefOrGetter, MaybeRef } from "vue";
import { resolve } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

import { useLoadingFactory } from '@/utils/use-loading-factory';

/**
 * @param connection - The Solana RPC connection object
 * @param domain - The domain name to resolve
 *
 * @returns ref publicKey of the domain owner, or undefined if not found.
 *
 * @example
 * const { result: owner, isLoading, loadingError } = useDomainOwner(connection, 'domain');
 * console.log(owner.value); // '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b' | undefined
 */
export const useDomainOwner = (
  connection: MaybeRef<Connection | null | undefined>,
  domain: Ref<string | null | undefined>,
) => {
  const refConnection = toRef(connection);
  const refDomain = toRef(domain);

  return useLoadingFactory(async () => {
    let owner: PublicKey | null = null;

    if (refDomain.value && refConnection.value) {
      owner = await resolve(refConnection.value as Connection, refDomain.value);
    }

    return owner;
  }, [refDomain, refConnection]);
};
