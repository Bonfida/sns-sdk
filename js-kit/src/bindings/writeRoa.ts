import { Address } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { writeRoaInstruction } from "../instructions/writeRoaInstruction";
import { Record, RecordVersion } from "../types/record";

/**
 * Writes a ROA (Right of association) in a record.
 *
 * @param domain - The domain under which the record will be written.
 * @param record - An enumeration representing the type of record to be written.
 * @param owner - The address of the domain's owner.
 * @param payer - The address funding the operation.
 * @param roaId - The identifier for the ROA.
 * @returns A promise that resolves to the write ROA instruction.
 */
export const writeRoa = async (
  domain: string,
  record: Record,
  owner: Address,
  payer: Address,
  roaId: Address
) => {
  let { address, isSub, parentAddress } = await getDomainAddress(
    `${record}.${domain}`,
    RecordVersion.V2
  );

  if (isSub) {
    parentAddress = (await getDomainAddress(domain)).address;
  }

  if (!parentAddress) {
    throw new InvalidParentError("Parent could not be found");
  }

  const ix = new writeRoaInstruction({
    roaId,
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
