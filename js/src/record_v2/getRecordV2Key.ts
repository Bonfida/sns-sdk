import { PublicKey } from "@solana/web3.js";
import { CENTRAL_STATE_SNS_RECORDS } from "@bonfida/sns-records";
import { Record } from "../types/record";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

/**
 * This function derives a record v2 key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns Public key of the record
 */
export const getRecordV2Key = (domain: string, record: Record): PublicKey => {
  const { pubkey } = getDomainKeySync(domain);
  const hashed = getHashedNameSync(`\x02`.concat(record as string));
  return getNameAccountKeySync(hashed, CENTRAL_STATE_SNS_RECORDS, pubkey);
};
