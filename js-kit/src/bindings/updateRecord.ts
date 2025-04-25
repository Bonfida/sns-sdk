import { Address, IInstruction } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { updateRecordInstruction } from "../instructions/updateRecordInstruction";
import { Record, RecordVersion } from "../types/record";
import { serializeRecordContent } from "../utils/serializers/serializeRecordContent";

interface UpdateRecordParams {
  domain: string;
  record: Record;
  content: string;
  owner: Address;
  payer: Address;
}

/**
 * Updates an existing record under the specified domain.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The domain under which the record resides.
 *   - `record`: An enumeration representing the type of record to be updated.
 *   - `content`: The updated content to be associated with the record.
 *   - `owner`: The address of the domain's owner.
 *   - `payer`: The address funding the record update.
 * @returns A promise that resolves to the update record instruction.
 */
export const updateRecord = async ({
  domain,
  record,
  content,
  owner,
  payer,
}: UpdateRecordParams): Promise<IInstruction> => {
  let { domainAddress, isSub, parentAddress } = await getDomainAddress({
    domain: `${record}.${domain}`,
    record: RecordVersion.V2,
  });

  if (isSub) {
    parentAddress = (await getDomainAddress({ domain })).domainAddress;
  }

  if (!parentAddress) {
    throw new InvalidParentError("Parent could not be found");
  }

  const ix = new updateRecordInstruction({
    record: `\x02${record}`,
    content: serializeRecordContent({ content, record }),
  }).getInstruction(
    RECORDS_PROGRAM_ADDRESS,
    SYSTEM_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    payer,
    domainAddress,
    parentAddress,
    owner,
    CENTRAL_STATE_DOMAIN_RECORDS
  );

  return ix;
};
