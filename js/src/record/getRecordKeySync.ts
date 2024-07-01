import { Record, RecordVersion } from "../types/record";
import { getDomainKeySync } from "../utils/getDomainKeySync";

/**
 * This function can be used to derive a record key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns
 */
export const getRecordKeySync = (domain: string, record: Record) => {
  const { pubkey } = getDomainKeySync(record + "." + domain, RecordVersion.V1);
  return pubkey;
};
