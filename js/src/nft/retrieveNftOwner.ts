import {
  Connection,
  GetProgramAccountsFilter,
  PublicKey,
} from "@solana/web3.js";
import { getDomainMint } from "./getDomainMint";
import { TOKEN_PROGRAM_ID, getMint } from "@solana/spl-token";

/**
 * This function can be used to retrieve the owner of a tokenized domain name
 *
 * @param connection The solana connection object to the RPC node
 * @param nameAccount The key of the domain name
 * @returns
 */
export const retrieveNftOwner = async (
  connection: Connection,
  nameAccount: PublicKey,
) => {
  try {
    const mint = getDomainMint(nameAccount);

    const mintInfo = await getMint(connection, mint);
    if (mintInfo.supply.toString() === "0") {
      return undefined;
    }

    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          offset: 0,
          bytes: mint.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 64,
          bytes: "2",
        },
      },
      { dataSize: 165 },
    ];

    const result = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters,
    });

    if (result.length != 1) {
      return undefined;
    }

    return new PublicKey(result[0].account.data.slice(32, 64));
  } catch {
    return undefined;
  }
};
