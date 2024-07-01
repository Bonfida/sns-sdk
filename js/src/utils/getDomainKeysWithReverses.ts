import { Connection, PublicKey } from "@solana/web3.js";

import { reverseLookupBatch } from "./reverseLookupBatch";
import { getAllDomains } from "./getAllDomains";

/**
 * This function can be used to retrieve all domain names owned by `wallet` in a human readable format
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns Array of pubkeys and the corresponding human readable domain names
 */
export async function getDomainKeysWithReverses(
  connection: Connection,
  wallet: PublicKey,
) {
  const encodedNameArr = await getAllDomains(connection, wallet);
  const names = await reverseLookupBatch(connection, encodedNameArr);

  return encodedNameArr.map((pubKey, index) => ({
    pubKey,
    domain: names[index],
  }));
}
