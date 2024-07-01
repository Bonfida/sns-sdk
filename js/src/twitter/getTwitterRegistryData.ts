import { Buffer } from "buffer";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { NameRegistryState } from "../state";
import { MultipleRegistriesError } from "../error";

// Uses the RPC node filtering feature, execution speed may vary
// Does not give you the handle, but is an alternative to getHandlesAndKeysFromVerifiedPubkey + getTwitterRegistry to get the data
export async function getTwitterRegistryData(
  connection: Connection,
  verifiedPubkey: PublicKey,
): Promise<Buffer> {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: TWITTER_ROOT_PARENT_REGISTRY_KEY.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 32,
        bytes: verifiedPubkey.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 64,
        bytes: new PublicKey(Buffer.alloc(32, 0)).toBase58(),
      },
    },
  ];

  const filteredAccounts = await connection.getProgramAccounts(
    NAME_PROGRAM_ID,
    { filters },
  );

  if (filteredAccounts.length > 1) {
    throw new MultipleRegistriesError("More than 1 accounts were found");
  }

  return filteredAccounts[0].account.data.slice(NameRegistryState.HEADER_LEN);
}
