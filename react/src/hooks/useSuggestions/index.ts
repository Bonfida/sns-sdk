import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { generateRandomDomain } from "../../utils";
import { getDomainsResult, type Result } from "../useSearch";
import type { Connection } from "@solana/web3.js";

const URL = "https://sns-api.bonfida.com/v2/suggestion/search";

/**
 * Asynchronously tries to provide suggestions for provided domain. If nothing
 * to suggest, generates basic alternatives.
 *
 * @param {Connection} params.connection - The Solana connection instance
 * @param {string} params.domain - Domain name.
 * @returns {Promise<Result[]>}
 *
 * @example
 * // Example usage
 * const connection = new Connection(network);
 * const domain = 'solana';
 * const result = await useDomainSuggestions({ connection, domain });
 */
export const useDomainSuggestions = (
  connection: Connection,
  domain: string,
  options: Options<Result[]> = { queryKey: ["useDomainSuggestions", domain] },
) => {
  const fn = async () => {
    if (!domain || domain === "") return [];
    const splitted = domain.split(".");
    const isSub = splitted.length === 2;

    if (isSub) return [];

    const data: string[] = await (await fetch(`${URL}/${domain}`)).json();

    if (!data || data.length < 5) {
      if (!connection) return [];
      const alternatives = generateRandomDomain(domain, 10);
      const result = getDomainsResult(connection, alternatives);
      return result;
    }

    // All domains returned by the API are available
    return data.map((e) => {
      return { domain: e, available: true };
    });
  };

  return useQuery({ ...options, queryFn: fn });
};
