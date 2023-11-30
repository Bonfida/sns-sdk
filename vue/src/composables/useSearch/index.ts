import { MaybeRef, unref } from "vue";
import { Connection } from "@solana/web3.js";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import { useLoadingFactory, generateRandomDomain } from "@/utils";

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
 * @param {Connection} params.connection - The Solana connection instance
 * @param {string[]} params.domain - Domain name.
 * @returns {Promise<Result[]>}
 *
 * @example
 * // Example usage
 * const connection = new Connection(network);
 * const domain = 'solana';
 * const { result } = await useSearch({ connection, domain });
 */
export const useSearch = ({
  connection,
  domain,
}: {
  connection: MaybeRef<Connection>;
  domain: MaybeRef<string>;
}) => {
  return useLoadingFactory(
    async () => {
      const _domain = unref(domain);
      const _connection = unref(connection);

      if (!_domain || !_connection) return [];

      const splitted = _domain.split(".");
      const isSub = splitted.length === 2;

      if (isSub) {
        const parsedDomain = splitted[1];
        const subdomainKey = getDomainKeySync(_domain).pubkey;
        const subdomainInfo = await _connection.getAccountInfo(subdomainKey);

        const domainsAlternatives = generateRandomDomain(parsedDomain, 10);
        const domainsAlternativesResult = await getDomainsResult(
          _connection,
          domainsAlternatives,
        );
        // if the subdomain doesn't exists check if the domain is available
        if (!subdomainInfo?.data) {
          const domainKey = getDomainKeySync(parsedDomain).pubkey;
          const domainInfo = await _connection.getAccountInfo(domainKey);

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

      const domains = [_domain];
      return getDomainsResult(_connection, domains);
    },
    () => [unref(domain), unref(connection)],
  );
};
