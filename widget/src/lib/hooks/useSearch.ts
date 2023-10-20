import { getDomainKeySync } from "@bonfida/spl-name-service";
import { useConnectionPassThrough } from "../contexts/connection-passthrough-provider";
import { useAsync } from "react-async-hook";
import { generateRandomDomain } from "../utils";
import { Connection } from "@solana/web3.js";

export interface Result {
  domain: string;
  available: boolean;
}

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

export const useSearch = (domain: string) => {
  const { connection } = useConnectionPassThrough();
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
      // if the subdomain doesn't exists check if the domain is available
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

  return useAsync(fn, [!!connection, domain]);
};
