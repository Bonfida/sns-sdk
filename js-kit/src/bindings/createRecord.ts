import { Address } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { allocateAndPostRecordInstruction } from "../instructions/allocateAndPostRecordInstructio";
import { Record, RecordVersion } from "../types/record";
import { serializeRecordContent } from "../utils/serializers/serializeRecordContent";

/**
 * Creates a record for the specified domain. The record data will be serialized
 * in compliance with the SNS-IP 1 guidelines.
 *
 * @param domain - The domain under which the record will be created.
 * @param record - A record enum representing the type of record to be created.
 * @param content - The record content.
 * @param owner - The address of the domain's owner.
 * @param payer - The address funding the record creation.
 * @returns A promise which resolves to the create record instruction.
 */

export const createRecord = async (
  domain: string,
  record: Record,
  content: string,
  owner: Address,
  payer: Address
) => {
  let { address, parentAddress, isSub } = await getDomainAddress(
    `${record}.${domain}`,
    RecordVersion.V2
  );

  if (isSub) {
    parentAddress = (await getDomainAddress(domain)).address;
  }

  if (!parentAddress) {
    throw new InvalidParentError("Parent could not be found");
  }

  const ix = new allocateAndPostRecordInstruction({
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
