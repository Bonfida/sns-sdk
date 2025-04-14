import { Address } from "@solana/kit";

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

/**
 * Updates an existing record under the specified domain.
 *
 * @param domain - The domain under which the record resides.
 * @param record - An enumeration representing the type of record to be updated.
 * @param content - The updated content to be associated with the record.
 * @param owner - The address of the domain's owner.
 * @param payer - The address funding the record update.
 * @returns A promise that resolves to the update record instruction.
 */
export const updateRecord = async (
  domain: string,
  record: Record,
  content: string,
  owner: Address,
  payer: Address
) => {
  let { address, isSub, parentAddress } = await getDomainAddress(
    `${record}.${domain}`,
    RecordVersion.V2
  );

  if (isSub) {
    // parentAddress = getDomainKeySync(domain).pubkey;
    parentAddress = (await getDomainAddress(domain)).address;
  }

  if (!parentAddress) {
    throw new InvalidParentError("Parent could not be found");
  }

  const ix = new updateRecordInstruction({
    record: `\x02${record}`,
    content: serializeRecordContent(content, record),
  }).getInstruction(
    RECORDS_PROGRAM_ADDRESS,
    SYSTEM_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    payer,
    address,
    parentAddress,
    owner,
    CENTRAL_STATE_DOMAIN_RECORDS
  );

  return ix;
};
