import {
  Connection,
  PublicKey,
  GetProgramAccountsFilter,
} from "@solana/web3.js";
import { NAME_TOKENIZER_ID } from "./const";
import { NftRecord } from "./state";

/**
 * This function can be used to retrieve a NFT Record given a mint
 *
 * @param connection A solana RPC connection
 * @param mint The mint of the NFT Record
 * @returns
 */
export const getRecordFromMint = async (
  connection: Connection,
  mint: PublicKey,
) => {
  const filters: GetProgramAccountsFilter[] = [
    { dataSize: NftRecord.LEN },
    {
      memcmp: {
        offset: 0,
        bytes: "3",
      },
    },
    {
      memcmp: {
        offset: 1 + 1 + 32 + 32,
        bytes: mint.toBase58(),
      },
    },
  ];

  const result = await connection.getProgramAccounts(NAME_TOKENIZER_ID, {
    filters,
  });

  return result;
};
