import { GetProgramAccountsApi, Rpc } from "@solana/kit";

import {
  NAME_PROGRAM_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
} from "../constants/addresses";

/**
 * This function can be used to retrieve all the registered `.sol` domains.
 * The account data is sliced to avoid enormous payload and only the owner is returned
 * @param connection The Solana RPC connection object
 * @returns
 */
export const getAllDomains = async (rpc: Rpc<GetProgramAccountsApi>) => {
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
