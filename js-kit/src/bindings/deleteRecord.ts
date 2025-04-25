import { Address, IInstruction } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { deleteRecordInstruction } from "../instructions/deleteRecordInstruction";
import { Record, RecordVersion } from "../types/record";

interface DeleteRecordParams {
  domain: string;
  record: Record;
  owner: Address;
  payer: Address;
}

/**
 * Deletes a record under the specified domain and refunds the rent to the payer.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The domain under which the record resides.
 *   - `record`: An enumeration representing the type of record to be deleted.
 *   - `owner`: The address of the domain's owner.
 *   - `payer`: The address funding the record deletion.
 * @returns A promise which resolves to the delete record instruction.
 */
export const deleteRecord = async ({
  domain,
  record,
  owner,
  payer,
}: DeleteRecordParams): Promise<IInstruction> => {
  let { domainAddress, parentAddress, isSub } = await getDomainAddress({
    domain: `${record}.${domain}`,
    record: RecordVersion.V2,
  });

  if (isSub) {
    parentAddress = (await getDomainAddress({ domain })).domainAddress;
  }

  if (!parentAddress) {
    throw new InvalidParentError("Parent could not be found");
  }

  const ix = new deleteRecordInstruction().getInstruction(
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
