import { ref, watch, Ref, MaybeRef, toRef } from "vue";
import { resolve } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * @param connection - The Solana RPC connection object
 * @param domain - The domain name to resolve
 *
 * @returns ref publicKey of the domain owner, or undefined if not found.
 *
 * @example
 * const { owner, isLoading, loadingError } = useDomainOwner(connection, 'domain');
 * console.log(owner.value); // '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b' | undefined
 */
export const useDomainOwner = (
  connection: Connection | null | undefined,
  domain: MaybeRef<string | null | undefined>,
) => {
  const owner = ref<PublicKey | null>(null);
  const refDomain = toRef(domain);
  const isLoading = ref(false);
  const loadingError: Ref<any> = ref(null);

  const updateOwner = async () => {
    try {
      isLoading.value = true;
      loadingError.value = null;

      if (refDomain.value && connection) {
        owner.value = await resolve(connection, refDomain.value);
      } else {
        owner.value = null;
      }
    } catch (err) {
      loadingError.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  watch(refDomain, updateOwner, { immediate: true });

  return {
    owner,
    isLoading,
    loadingError,
  };
};
