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
