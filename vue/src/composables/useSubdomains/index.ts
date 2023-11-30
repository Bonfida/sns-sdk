import { MaybeRef, computed, toRef, unref } from "vue";
import { findSubdomains } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";
import { useLoadingFactory } from "@/utils/use-loading-factory";
import { toDomainKey } from "@/utils/domain-to-key";

/**
 * Returns the list of all sudomains for a given parent
 * @param connection The Solana RPC connection object
 * @param domain The parent domain name (or its public key)
 * @returns The list of sub-domains of `domain`
 * @example
 * const { result } = useSubdomains(connection, 'domain');
 */
export const useSubdomains = (
  connection: MaybeRef<Connection>,
  domain: MaybeRef<string | PublicKey | undefined | null>,
) => {
  const refDomain = toRef(domain);
  const key = computed(() => toDomainKey(refDomain.value));

  return useLoadingFactory(
    async () => {
      if (!key.value) return;

      return findSubdomains(unref(connection), key.value);
    },
    () => [unref(connection), key.value],
  );
};
