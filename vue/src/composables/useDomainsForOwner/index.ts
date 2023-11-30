import { MaybeRef, toRef, unref, computed } from "vue";
import { getAllDomains, reverseLookupBatch } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { toKey } from "@/utils/pubkey";

import { useLoadingFactory } from "@/utils/use-loading-factory";

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
  connection: MaybeRef<Connection | null | undefined>,
  owner: MaybeRef<string | PublicKey | null | undefined>,
) => {
  return useLoadingFactory(
    async () => {
      const rawOwner = unref(owner);
      const rawConnection = unref(connection);

      const key = rawOwner ? toKey(rawOwner) : null;

      if (!key || !rawConnection) return [];

      const domains = await getAllDomains(rawConnection, key);
      const reverses = await reverseLookupBatch(rawConnection, domains);

      if (!domains.length || !reverses.length) return [];

      return domains
        .map((e, idx) => {
          return { pubkey: e, domain: reverses[idx] };
        })
        .filter((e) => !!e.domain)
        .sort((a, b) =>
          (a.domain as string).localeCompare(b.domain as string),
        ) as Result;
    },
    () => [unref(connection), unref(owner)],
  );
};
