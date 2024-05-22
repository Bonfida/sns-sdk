import { Connection, PublicKey } from "@solana/web3.js";
import { NAME_PROGRAM_ID, ROOT_DOMAIN_ACCOUNT } from "../constants";

/**
 * This function can be used to retrieve all domain names owned by `wallet`
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns
 */
export async function getAllDomains(
  connection: Connection,
  wallet: PublicKey,
): Promise<PublicKey[]> {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: wallet.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 0,
        bytes: ROOT_DOMAIN_ACCOUNT.toBase58(),
      },
    },
  ];
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters,
    // Only the public keys matter, not the data
    dataSlice: { offset: 0, length: 0 },
  });
  return accounts.map((a) => a.pubkey);
}
