import { useAsync } from "react-async-hook";
import { useConnectionPassThrough } from "../contexts/connection-passthrough-provider";
import { generateRandomDomain } from "../utils";
import { getDomainsResult } from "./useSearch";

const URL = "https://sns-api.bonfida.com/v2/suggestion/search";

export const useDomainSuggestions = (domain: string) => {
  const { connection } = useConnectionPassThrough();

  const fn = async () => {
    if (!domain || domain === "") return;

    const data: string[] = await (
      await fetch(`${URL}/${domain}`, {
        method: "GET",
      })
    ).json();

    const splitted = domain.split(".");
    const isSub = splitted.length === 2;
    if (isSub) return [];
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

  return useAsync(fn, [domain, !!connection]);
};
