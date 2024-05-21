import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "../state";
import { REVERSE_LOOKUP_CLASS } from "../constants";

import { getHashedNameSync } from "./getHashedNameSync";
import { getNameAccountKeySync } from "./getNameAccountKeySync";
import { deserializeReverse } from "./deserializeReverse";

/**
 * This function can be used to perform a reverse look up
 * @param connection The Solana RPC connection
 * @param nameAccount The public keys of the domains to look up
 * @returns The human readable domain names
 */
export async function reverseLookupBatch(
  connection: Connection,
  nameAccounts: PublicKey[],
): Promise<(string | undefined)[]> {
  let reverseLookupAccounts: PublicKey[] = [];
  for (let nameAccount of nameAccounts) {
    const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
    const reverseLookupAccount = getNameAccountKeySync(
      hashedReverseLookup,
      REVERSE_LOOKUP_CLASS,
    );
    reverseLookupAccounts.push(reverseLookupAccount);
  }

  let names = await NameRegistryState.retrieveBatch(
    connection,
    reverseLookupAccounts,
  );

  return names.map((name) => {
    if (name === undefined || name.data === undefined) {
      return undefined;
    }
    return deserializeReverse(name.data);
  });
}
