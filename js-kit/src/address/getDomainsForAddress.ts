import {
  Address,
  GetMultipleAccountsApi,
  GetProgramAccountsApi,
  Rpc,
} from "@solana/kit";

import {
  NAME_PROGRAM_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
} from "../constants/addresses";
import { reverseLookupBatch } from "../utils/reverseLookupBatch";

interface Result {
  domain: string;
  domainAddress: Address;
}

/**
 * Retrieves the domains owned by the given address.
 *
 * @param rpc - An RPC interface implementing GetProgramAccountsApi and GetMultipleAccountsApi.
 * @param address - The address for which to retrieve associated domains.
 * @returns A promise resolving to an array of objects containing domain and domainAddress.
 */
export const getDomainsForAddress = async (
  rpc: Rpc<GetProgramAccountsApi & GetMultipleAccountsApi>,
  address: Address
): Promise<Result[]> => {
  const results = await rpc
    .getProgramAccounts(NAME_PROGRAM_ADDRESS, {
      encoding: "base64",
      filters: [
        {
          memcmp: {
            offset: 32n,
            bytes: address,
            encoding: "base58",
          },
        },
        {
          memcmp: {
            offset: 0n,
            bytes: ROOT_DOMAIN_ADDRESS,
            encoding: "base58",
          },
        },
      ],
      dataSlice: {
        offset: 0,
        length: 0,
      },
    })
    .send();

  const domains = await reverseLookupBatch(
    rpc,
    results.map((r) => r.pubkey)
  );

  return domains
    .map((domain, idx) =>
      domain
        ? {
            domain,
            domainAddress: results[idx].pubkey,
          }
        : undefined
    )
    .filter((e) => e !== undefined);
};
