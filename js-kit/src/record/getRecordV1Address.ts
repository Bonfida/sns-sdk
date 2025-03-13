import { getDomainAddress } from "../domain/getDomainAddress";
import { Record, RecordVersion } from "../types/record";

/**
 * Derives the address for a given domain and V1 record.
 *
 * @param {string} domain - The domain name.
 * @param {Record} record - The record type.
 * @returns {Promise<Address>} - The corresponding address.
 */
export const getRecordV1Address = async (domain: string, record: Record) => {
  const { address } = await getDomainAddress(
    record + "." + domain,
    RecordVersion.V1
  );
  
  return address;
};
