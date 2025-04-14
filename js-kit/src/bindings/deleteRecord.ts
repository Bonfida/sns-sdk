import { Address } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { deleteRecordInstruction } from "../instructions/deleteRecordInstructio copy";
import { Record, RecordVersion } from "../types/record";

/**
 * Deletes a record under the specified domain and refunds the rent to the payer.
 *
 * @param domain - The domain under which the record resides.
 * @param record - An enumeration representing the type of record to be deleted.
 * @param owner - The address of the domain's owner.
 * @param payer - The address funding the record deletion.
 * @returns A promise which resolves to the delete record instruction.
 */
export const deleteRecord = async (
  domain: string,
  record: Record,
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

  const ix = new deleteRecordInstruction().getInstruction(
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
