import { Record } from "../types/record";
import { getDomainKey } from "./utils";

/**
 * @deprecated Use {@link getRecordKeySync} instead
 * This function can be used to derive a record key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns
 */
export const getRecordKey = async (domain: string, record: Record) => {
  const { pubkey } = await getDomainKey(record + "." + domain, true);
  return pubkey;
};
