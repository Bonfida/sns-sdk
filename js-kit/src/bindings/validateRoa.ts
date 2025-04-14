import { Address } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { validateRoaInstruction } from "../instructions/validateRoaInstruction";
import { Record, RecordVersion } from "../types/record";

/**
 * Validates the right of association of a record.
 *
 * @param staleness - Indicates whether the record validation is stale.
 * @param domain - The domain under which the record resides.
 * @param record - An enumeration representing the type of record to validate.
 * @param owner - The address of the domain's owner.
 * @param payer - The address funding the validation process.
 * @param verifier - The address responsible for verifying the record.
 * @returns A promise that resolves to the validate ROA instruction.
 */
export const validateRoa = async (
  staleness: boolean,
  domain: string,
  record: Record,
  owner: Address,
  payer: Address,
  verifier: Address
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

  const ix = new validateRoaInstruction({
    staleness,
  }).getInstruction(
    RECORDS_PROGRAM_ADDRESS,
    SYSTEM_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    payer,
    address,
    parentAddress,
    owner,
    CENTRAL_STATE_DOMAIN_RECORDS,
    verifier
  );

  return ix;
};
