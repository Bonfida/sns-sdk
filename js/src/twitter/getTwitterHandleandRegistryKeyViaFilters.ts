import { deserialize } from "borsh";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_VERIFICATION_AUTHORITY,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { NameRegistryState } from "../state";
import { AccountDoesNotExistError } from "../error";

import { ReverseTwitterRegistryState } from "./ReverseTwitterRegistryState";

// Uses the RPC node filtering feature, execution speed may vary
export async function getTwitterHandleandRegistryKeyViaFilters(
  connection: Connection,
  verifiedPubkey: PublicKey,
): Promise<[string, PublicKey]> {
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
        bytes: TWITTER_VERIFICATION_AUTHORITY.toBase58(),
      },
    },
  ];
  const filteredAccounts = await connection.getProgramAccounts(
    NAME_PROGRAM_ID,
    { filters },
  );

  for (const f of filteredAccounts) {
    if (f.account.data.length > NameRegistryState.HEADER_LEN + 32) {
      const data = f.account.data.slice(NameRegistryState.HEADER_LEN);
      const state = new ReverseTwitterRegistryState(
        deserialize(ReverseTwitterRegistryState.schema, data) as any,
      );
      return [state.twitterHandle, new PublicKey(state.twitterRegistryKey)];
    }
  }

  throw new AccountDoesNotExistError("The twitter account does not exist");
}
