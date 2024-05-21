import { PublicKey } from "@solana/web3.js";
import { REVERSE_LOOKUP_CLASS } from "../constants";

import { getHashedNameSync } from "./getHashedNameSync";
import { getNameAccountKeySync } from "./getNameAccountKeySync";

/**
 * This function can be used to get the reverse key from a domain key
 * @param domainKey The domain key to compute the reverse for
 * @param parent The parent public key
 * @returns The public key of the reverse account
 */
export const getReverseKeyFromDomainKey = (
  domainKey: PublicKey,
  parent?: PublicKey,
) => {
  const hashedReverseLookup = getHashedNameSync(domainKey.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
    parent,
  );
  return reverseLookupAccount;
};
