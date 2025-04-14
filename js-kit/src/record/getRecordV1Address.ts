import { getDomainAddress } from "../domain/getDomainAddress";
import { Record, RecordVersion } from "../types/record";

/**
 * Derives the address of a version 1 record.
 *
 * @param domain - The domain under which the record resides.
 * @param record - The type of record to derive the address for.
 * @returns A promise that resolves to the derived record address.
 */
export const getRecordV1Address = async (domain: string, record: Record) => {
  const { address } = await getDomainAddress(
    record + "." + domain,
    RecordVersion.V1
  );

  return address;
};
