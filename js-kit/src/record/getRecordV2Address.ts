import { Address } from "@solana/kit";

import { CENTRAL_STATE_DOMAIN_RECORDS } from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { Record } from "../types/record";
import { deriveAddress } from "../utils/deriveAddress";

/**
 * Derives the address of a version 2 record.
 *
 * @param domain - The domain under which the record resides.
 * @param record - The type of record to derive the address for.
 * @returns A promise that resolves to the derived record address.
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
