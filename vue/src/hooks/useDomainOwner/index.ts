import { ref, watch, Ref, toRef } from "vue";
import { resolve } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * @param connection - The Solana RPC connection object
 * @param domain - The domain name to resolve
 *
 * @returns ref publicKey of the domain owner, or undefined if not found.
 *
 * @example
 * const owner = useDomainOwner(connection, 'domain');
 * console.log(owner.value); // '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b' | undefined
 */
export const useDomainOwner = (
  connection: Connection | null | undefined,
  domain: Ref<string | null | undefined> | string | null | undefined,
): Ref<PublicKey | undefined> => {
  const owner = ref<PublicKey | undefined>(undefined);
  const refDomain = toRef(domain);

  const updateOwner = async () => {
    if (refDomain.value && connection) {
      owner.value = await resolve(connection, refDomain.value);
    } else {
      owner.value = undefined;
    }
  }

  watch(refDomain, updateOwner, { immediate: true });

  return owner;
};
