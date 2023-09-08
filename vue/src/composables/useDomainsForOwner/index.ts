import { MaybeRef, toRef, ref, watch, computed, Ref } from 'vue';
import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "@/utils/pubkey";

import { useLoadingFactory } from '@/utils/use-loading-factory';

type Result = { pubkey: PublicKey; domain: string }[];

/**
 * @param connection - The Solana RPC connection object
 * @param domain - The domain name to resolve
 *
 * @returns Returns all the domains for the specified owner
 *
 * @example
 * const { result: domains, isLoading, loadingError } = useDomainOwner(connection, '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b');
 */
export const useDomainsForOwner = (
  connection: Connection | null | undefined,
  owner: MaybeRef<string | PublicKey | null | undefined>
) => {
  const refOwner = toRef(owner);
  const key = computed(() => refOwner.value ? toKey(refOwner.value) : null);

  return useLoadingFactory(async () => {
    let domainsForOwner: Result = [];

    if (key.value && connection) {
      const domains = await getAllDomains(connection, key.value);
      const reverses = await reverseLookupBatch(connection, domains);

      if (!domains.length || !reverses.length) {
        domainsForOwner = [];
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

      domainsForOwner = result;
    }

    return domainsForOwner;
  }, [key]);
};
