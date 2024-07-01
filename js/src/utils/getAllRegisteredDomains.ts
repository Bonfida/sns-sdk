import { Connection } from "@solana/web3.js";
import { NAME_PROGRAM_ID, ROOT_DOMAIN_ACCOUNT } from "../constants";

/**
 * This function can be used to retrieve all the registered `.sol` domains.
 * The account data is sliced to avoid enormous payload and only the owner is returned
 * @param connection The Solana RPC connection object
 * @returns
 */
export const getAllRegisteredDomains = async (connection: Connection) => {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: ROOT_DOMAIN_ACCOUNT.toBase58(),
      },
    },
  ];
  const dataSlice = { offset: 32, length: 32 };

  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    dataSlice,
    filters,
  });
  return accounts;
};
