import { Address } from "@solana/kit";

import { NAME_PROGRAM_ID, RECORDS_PROGRAM_ID } from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { Record, RecordVersion } from "../types/record";
import { serializeRecordContent } from "../utils/serializers/serializeRecordContent";

export const createRecordV2Instruction = async (
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
    parentAddress = await getDomainAddress(domain).then(
      (domainAddress) => domainAddress.address
    );
  }

  if (!parentAddress) {
    throw new InvalidParentError("Parent could not be found");
  }

  const ix = allocateAndPostRecord(
    payer,
    address,
    parentAddress,
    owner,
    NAME_PROGRAM_ID,
    `\x02${record}`,
    serializeRecordContent(content, record),
    RECORDS_PROGRAM_ID
  );
  return ix;
};
