import { GetProgramAccountsApi, Rpc } from "@solana/kit";

import {
  NAME_PROGRAM_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
} from "../constants/addresses";

interface GetAllDomainsParams {
  rpc: Rpc<GetProgramAccountsApi>;
}

/**
 * Retrieves the addresses of all .sol domains.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetProgramAccountsApi.
 * @returns A promise that resolves to an array of objects representing domain addresses and owners.
 */
export const getAllDomains = async ({ rpc }: GetAllDomainsParams) => {
  const accounts = await rpc
    .getProgramAccounts(NAME_PROGRAM_ADDRESS, {
      encoding: "base58",
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: ROOT_DOMAIN_ADDRESS,
            encoding: "base58",
          },
        },
      ],
      dataSlice: { offset: 32, length: 32 },
    })
    .send();

  return accounts.map(({ account: { data }, pubkey }) => ({
    domainAddress: pubkey,
    owner: data[0],
  }));
};
