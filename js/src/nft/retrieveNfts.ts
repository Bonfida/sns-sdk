import {
  Connection,
  GetProgramAccountsFilter,
  PublicKey,
} from "@solana/web3.js";
import { NAME_TOKENIZER_ID } from "./const";
import { NftRecord } from "./state";

/**
 * This function can be used to retrieve all the tokenized domains name
 *
 * @param connection The solana connection object to the RPC node
 * @returns
 */
export const retrieveNfts = async (connection: Connection) => {
  const filters: GetProgramAccountsFilter[] = [
    { dataSize: NftRecord.LEN },
    {
      memcmp: {
        offset: 0,
        bytes: "3",
      },
    },
  ];

  const result = await connection.getProgramAccounts(NAME_TOKENIZER_ID, {
    filters,
  });
  const offset = 1 + 1 + 32 + 32;
  return result.map(
    (e) => new PublicKey(e.account.data.slice(offset, offset + 32)),
  );
};
