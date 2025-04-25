import { Address, IInstruction } from "@solana/kit";

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

interface WriteRoaParams {
  domain: string;
  record: Record;
  owner: Address;
  payer: Address;
  roaId: Address;
}

/**
 * Writes a ROA (Right of association) in a record.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The domain under which the record will be written.
 *   - `record`: An enumeration representing the type of record to be written.
 *   - `owner`: The address of the domain's owner.
 *   - `payer`: The address funding the operation.
 *   - `roaId`: The identifier for the ROA.
 * @returns A promise that resolves to the write ROA instruction.
 */
export const writeRoa = async ({
  domain,
  record,
  owner,
  payer,
  roaId,
}: WriteRoaParams): Promise<IInstruction> => {
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

  const ix = new writeRoaInstruction({
    roaId,
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
