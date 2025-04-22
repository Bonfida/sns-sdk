import { Address, IInstruction } from "@solana/kit";

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

interface ValidateRoaParams {
  staleness: boolean;
  domain: string;
  record: Record;
  owner: Address;
  payer: Address;
  verifier: Address;
}

/**
 * Validates the right of association of a record.
 *
 * @param params - An object containing the following properties:
 *   - `staleness`: Indicates whether the record validation is stale.
 *   - `domain`: The domain under which the record resides.
 *   - `record`: An enumeration representing the type of record to validate.
 *   - `owner`: The address of the domain's owner.
 *   - `payer`: The address funding the validation process.
 *   - `verifier`: The address responsible for verifying the record.
 * @returns A promise that resolves to the validate ROA instruction.
 */
export const validateRoa = async ({
  staleness,
  domain,
  record,
  owner,
  payer,
  verifier,
}: ValidateRoaParams): Promise<IInstruction> => {
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

  const ix = new validateRoaInstruction({
    staleness,
  }).getInstruction(
    RECORDS_PROGRAM_ADDRESS,
    SYSTEM_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    payer,
    domainAddress,
    parentAddress,
    owner,
    CENTRAL_STATE_DOMAIN_RECORDS,
    verifier
  );

  return ix;
};
