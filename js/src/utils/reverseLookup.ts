import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "../state";
import { REVERSE_LOOKUP_CLASS } from "../constants";
import { NoAccountDataError } from "../error";

import { getHashedNameSync } from "./getHashedNameSync";
import { getNameAccountKeySync } from "./getNameAccountKeySync";
import { deserializeReverse } from "./deserializeReverse";

/**
 * This function can be used to perform a reverse look up
 * @param connection The Solana RPC connection
 * @param nameAccount The public key of the domain to look up
 * @returns The human readable domain name
 */
export async function reverseLookup(
  connection: Connection,
  nameAccount: PublicKey,
): Promise<string> {
  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
  );

  const { registry } = await NameRegistryState.retrieve(
    connection,
    reverseLookupAccount,
  );
  if (!registry.data) {
    throw new NoAccountDataError("The registry data is empty");
  }

  return deserializeReverse(registry.data);
}
