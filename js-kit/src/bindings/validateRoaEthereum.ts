import { Address } from "@solana/kit";

import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  NAME_PROGRAM_ADDRESS,
  RECORDS_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidParentError } from "../errors";
import { validateRoaEthereumInstruction } from "../instructions/validateRoaEthereumInstruction";
import { Record, RecordVersion } from "../types/record";
import { Validation } from "../types/validation";

/**
 * Validates the right of association of a record using an Ethereum signature.
 *
 * @param domain - The domain under which the record resides.
 * @param record - An enumeration representing the type of record to validate.
 * @param owner - The address of the domain's owner.
 * @param payer - The address funding the validation process.
 * @param signature - The signature used for validation.
 * @param expectedPubkey - The expected public key associated with the validation.
 * @returns A promise that resolves to the validate ROA Ethereum instruction.
 */
export const validateRoaEthereum = async (
  domain: string,
  record: Record,
  owner: Address,
  payer: Address,
  signature: Uint8Array,
  expectedPubkey: Uint8Array
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

  const ix = new validateRoaEthereumInstruction({
    validation: Validation.Ethereum,
    signature,
    expectedPubkey,
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
