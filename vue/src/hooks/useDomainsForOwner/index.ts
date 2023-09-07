import { MaybeRef, toRef, ref, watch, computed, Ref } from 'vue';
import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "@/utils/pubkey";

type Result = { pubkey: PublicKey; domain: string }[];

/**
 * @param connection - The Solana RPC connection object
 * @param domain - The domain name to resolve
 *
 * @returns Returns all the domains for the specified owner
 *
 * @example
 * const pubKey = ref('9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b')
 * const { domains, isLoading, loadingError } = useDomainOwner(connection, pubKey);
 */
export const useDomainsForOwner = (
  connection: Connection | null | undefined,
  owner: MaybeRef<string | PublicKey | null | undefined>
) => {
  const refOwner = toRef(owner);
  const key = computed(() => toKey(refOwner.value));

  const domainsForOwner = ref<Result>([]);
  const isLoading = ref(false);
  const loadingError: Ref<any> = ref(null);

  const loadDomains = async () => {
    try {
      if (key.value && connection) {
        isLoading.value = true;
        loadingError.value = null;

        const domains = await getAllDomains(connection, key.value);
        const reverses = await reverseLookupBatch(connection, domains);

        if (!domains.length || !reverses.length) {
          domainsForOwner.value = [];
          return;
        }

        const result = domains
          .map((e, idx) => {
            return { pubkey: e, domain: reverses[idx] };
          })
          .filter((e) => !!e.domain)
          .sort((a, b) =>
            (a.domain as string).localeCompare(b.domain as string)
          ) as Result;

        domainsForOwner.value = result;
      } else {
        domainsForOwner.value = [];
      }
    } catch (err) {
      loadingError.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  watch(key, loadDomains, { immediate: true });

  return {
    domains: domainsForOwner,
    isLoading,
    loadingError,
  };
};
