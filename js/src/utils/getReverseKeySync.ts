import { REVERSE_LOOKUP_CLASS } from "../constants";

import { getHashedNameSync } from "./getHashedNameSync";
import { getNameAccountKeySync } from "./getNameAccountKeySync";
import { getDomainKeySync } from "./getDomainKeySync";

/**
 * This function can be used to get the key of the reverse account
 * @param domain The domain to compute the reverse for
 * @param isSub Whether the domain is a subdomain or not
 * @returns The public key of the reverse account
 */
export const getReverseKeySync = (domain: string, isSub?: boolean) => {
  const { pubkey, parent } = getDomainKeySync(domain);
  const hashedReverseLookup = getHashedNameSync(pubkey.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
    isSub ? parent : undefined,
  );
  return reverseLookupAccount;
};
