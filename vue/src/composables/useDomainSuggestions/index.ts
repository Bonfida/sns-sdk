import { MaybeRef, unref } from "vue";
import { Connection } from "@solana/web3.js";
import { useLoadingFactory, generateRandomDomain } from "@/utils";
import { type Result, getDomainsResult } from "../useSearch";

const URL = "https://sns-api.bonfida.com/v2/suggestion/search";

/**
 * Asynchronously tries to provide suggestions for provided domain. If nothing
 * to suggest, generates basic alternatives.
 *
 * @param {Connection} params.connection - The Solana connection instance
 * @param {string[]} params.domain - Domain name.
 * @returns {Promise<Result[]>}
 *
 * @example
 * // Example usage
 * const connection = new Connection(network);
 * const { result } = await useDomainSuggestions({ connection, domain: 'solana' });
 */
export const useDomainSuggestions = ({
  connection,
  domain,
}: {
  connection: MaybeRef<Connection>;
  domain: MaybeRef<string>;
}) => {
  return useLoadingFactory<Result[]>(
    async () => {
      const unrefDomain = unref(domain);
      const unrefConnection = unref(connection);

      if (!unrefDomain || unrefDomain === "") return [];

      const splitted = unrefDomain.split(".");
      const isSub = splitted.length === 2;

      if (isSub) return [];

      const data: string[] = await (
        await fetch(`${URL}/${unrefDomain}`)
      ).json();

      if (!data || data.length < 5) {
        if (!unrefConnection) return [];

        const alternatives = generateRandomDomain(unrefDomain, 10);
        const result = getDomainsResult(unrefConnection, alternatives);
        return result;
      }

      // All domains returned by the API are available
      return data.map((e) => {
        return { domain: e, available: true };
      });
    },
    () => [unref(domain), unref(connection)],
  );
};
