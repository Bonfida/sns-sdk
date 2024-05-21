import { Connection, PublicKey } from "@solana/web3.js";
import { retrieveRecords } from "../nft";
import { reverseLookupBatch } from "./reverseLookupBatch";

/**
 * This function can be used to retrieve all the tokenized domains of an owner
 * @param connection The Solana RPC connection object
 * @param owner The owner of the tokenized domains
 * @returns
 */
export const getTokenizedDomains = async (
  connection: Connection,
  owner: PublicKey,
) => {
  const nftRecords = await retrieveRecords(connection, owner);

  const names = await reverseLookupBatch(
    connection,
    nftRecords.map((e) => e.nameAccount),
  );

  return names
    .map((e, idx) => {
      return {
        key: nftRecords[idx].nameAccount,
        mint: nftRecords[idx].nftMint,
        reverse: e,
      };
    })
    .filter((e) => !!e.reverse);
};
