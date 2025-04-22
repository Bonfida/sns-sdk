import { Address, IInstruction } from "@solana/kit";

import {
  CENTRAL_STATE,
  NAME_PROGRAM_ADDRESS,
  REGISTRY_PROGRAM_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
  SYSVAR_RENT_ADDRESS,
} from "../constants/addresses";
import { createReverseInstruction } from "../instructions/createReverseInstruction";
import { deriveAddress } from "../utils/deriveAddress";

interface CreateReverseParams {
  domainAddress: Address;
  domain: string;
  payer: Address;
  parentAddress?: Address;
  parentOwner?: Address;
}

/**
 * Creates a reverse lookup record for the specified domain.
 *
 * @param params - An object containing the following properties:
 *   - `domainAddress`: The address of the domain for which the reverse lookup record is created.
 *   - `domain`: The domain name to be associated with the reverse lookup record.
 *   - `payer`: The address funding the creation of the reverse lookup record.
 *   - `parentAddress`: (Optional) The address of the parent domain, if applicable.
 *   - `parentOwner`: (Optional) The address of the parent domain owner, if applicable.
 * @returns A promise which resolves to the create reverse lookup instruction.
 */
export const createReverse = async ({
  domainAddress,
  domain,
  payer,
  parentAddress,
  parentOwner,
}: CreateReverseParams): Promise<IInstruction> => {
  const reverseLookupAccount = await deriveAddress(
    domainAddress,
    parentAddress,
    CENTRAL_STATE
  );

  let ix = new createReverseInstruction({
    domain: domain,
  }).getInstruction(
    REGISTRY_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    ROOT_DOMAIN_ADDRESS,
    reverseLookupAccount,
    SYSTEM_PROGRAM_ADDRESS,
    CENTRAL_STATE,
    payer,
    SYSVAR_RENT_ADDRESS,
    parentAddress,
    parentOwner
  );

  return ix;
};
