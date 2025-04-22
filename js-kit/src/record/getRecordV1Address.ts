import { getDomainAddress } from "../domain/getDomainAddress";
import { Record, RecordVersion } from "../types/record";

interface GetRecordV1AddressParams {
  domain: string;
  record: Record;
}

/**
 * Derives the address of a version 1 record.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The domain under which the record resides.
 *   - `record`: The type of record to derive the address for.
 * @returns A promise that resolves to the derived record address.
 */
export const getRecordV1Address = async ({
  domain,
  record,
}: GetRecordV1AddressParams) => {
  const { domainAddress } = await getDomainAddress({
    domain: record + "." + domain,
    record: RecordVersion.V1,
  });

  return domainAddress;
};
