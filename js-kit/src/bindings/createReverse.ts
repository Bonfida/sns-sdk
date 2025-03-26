import { Address } from "@solana/kit";

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

/**
 *
 * @param domainAddress The name account to create the reverse account for
 * @param domain The name of the domain
 * @param payer The fee payer of the transaction
 * @param parentAddress The parent name account
 * @param parentOwner The parent name owner
 * @returns
 */
export const createReverse = async (
  domainAddress: Address,
  domain: string,
  payer: Address,
  parentAddress?: Address,
  parentOwner?: Address
) => {
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
