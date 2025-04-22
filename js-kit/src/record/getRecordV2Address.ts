import { Address } from "@solana/kit";

import { CENTRAL_STATE_DOMAIN_RECORDS } from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { Record } from "../types/record";
import { deriveAddress } from "../utils/deriveAddress";

interface GetRecordV2AddressParams {
  domain: string;
  record: Record;
}

/**
 * Derives the address of a version 2 record.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The domain under which the record resides.
 *   - `record`: The type of record to derive the address for.
 * @returns A promise that resolves to the derived record address.
 */
export const getRecordV2Address = async ({
  domain,
  record,
}: GetRecordV2AddressParams): Promise<Address> => {
  const { domainAddress } = await getDomainAddress({ domain });

  return await deriveAddress(
    `\x02${record}`,
    domainAddress,
    CENTRAL_STATE_DOMAIN_RECORDS
  );
};
