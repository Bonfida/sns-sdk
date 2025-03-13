import { Address } from "@solana/kit";

import { CENTRAL_STATE_DOMAIN_RECORDS } from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { Record } from "../types/record";
import { deriveAddress } from "../utils/deriveAddress";

/**
 * Derives the address for a given domain and V2 record.
 *
 * @param {string} domain - The domain name.
 * @param {Record} record - The record type.
 * @returns {Promise<Address>} - The corresponding address.
 */
export const getRecordV2Address = async (
  domain: string,
  record: Record
): Promise<Address> => {
  const { address } = await getDomainAddress(domain);

  return await deriveAddress(
    `\x02${record}`,
    address,
    CENTRAL_STATE_DOMAIN_RECORDS
  );
};
