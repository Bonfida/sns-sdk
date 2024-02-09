import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import type { Connection } from "@solana/web3.js";
import { generateRandomDomain } from "../../utils";

export interface Result {
  domain: string;
  available: boolean;
}

/**
 * Asynchronously retrieves domains or/and subdomains availability information.
 *
 * @param {Connection} connection - The Solana connection instance
 * @param {string[]} domains - An array of domain names to check for availability.
 * @returns {Promise<Result[]>}
 *
 * @example
 * // Example usage
 * const connection = new Connection(network);
 * const domains = ['solana', 'main.solana'];
 * const result = await getDomainsResult(connection, domains);
 */
export const getDomainsResult = async (
  connection: Connection,
  domains: string[],
): Promise<Result[]> => {
  const keys = domains.map((e) => getDomainKeySync(e).pubkey);
  const infos = await connection?.getMultipleAccountsInfo(keys);
  if (!infos) {
    return [];
  }

  return domains.map((e, idx) => ({
    domain: e,
    available: !infos[idx]?.data,
  }));
};

/**
 * Asynchronously finds domain or subdomain and its availability. Provides basic
 * alternatives for subdomains.
 *
 * @param {Object} params - The parameters object.
 * @param {Connection} params.connection - The Solana connection instance.
 * @param {string} params.domain - The domain name to search for.
 * @param {Options<Result[]>} [params.options={ queryKey: ["useSearch", domain] }] - Optional. Configuration options for the query, including the query key.
 * @returns A React Query object containing the search results.
 *
 * @example
 * // Example usage
 * const connection = new Connection(network);
 * const domain = 'solana';
 * const { data, isLoading, error } = useSearch({ connection, domain });
 */
export const useSearch = ({
  connection,
  domain,
  options = { queryKey: ["useSearch", domain] },
}: {
  connection: Connection;
  domain: string;
  options?: Options<Result[]>;
}) => {
  const fn = async (): Promise<Result[]> => {
    if (!domain || !connection) return [];

    const splitted = domain.split(".");
    const isSub = splitted.length === 2;

    if (isSub) {
      const parsedDomain = splitted[1];
      const subdomainKey = getDomainKeySync(domain).pubkey;
      const subdomainInfo = await connection?.getAccountInfo(subdomainKey);

      const domainsAlternatives = generateRandomDomain(parsedDomain, 10);
      const domainsAlternativesResult = await getDomainsResult(
        connection,
        domainsAlternatives,
      );
      // if the subdomain doesn't exist, check if the domain is available
      if (!subdomainInfo?.data) {
        const domainKey = getDomainKeySync(parsedDomain).pubkey;
        const domainInfo = await connection?.getAccountInfo(domainKey);

        return [
          { domain: parsedDomain, available: !domainInfo?.data },
          ...domainsAlternativesResult,
        ];
      } else {
        return [
          { domain, available: !subdomainInfo.data },
          ...domainsAlternativesResult,
        ];
      }
    }

    const domains = [domain];
    return getDomainsResult(connection, domains);
  };

  return useQuery({ ...options, queryFn: fn });
};
