import { Address } from "@solana/kit";

import {
  CENTRAL_STATE,
  NAME_PROGRAM_ID,
  REGISTRY_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  SYSTEM_PROGRAM,
  SYSVAR_RENT_PUBKEY,
} from "../constants/addresses";
import { createReverseInstruction } from "../instructions/createReverseInstruction";
import { deriveAddress } from "../utils/deriveAddress";

/**
 *
 * @param nameAccount The name account to create the reverse account for
 * @param name The name of the domain
 * @param feePayer The fee payer of the transaction
 * @param parentAddress The parent name account
 * @param parentNameOwner The parent name owner
 * @returns
 */
export const createReverseName = async (
  nameAccount: Address,
  name: string,
  feePayer: Address,
  parentAddress?: Address,
  parentNameOwner?: Address
) => {
  const reverseLookupAccount = await deriveAddress(
    nameAccount,
    parentAddress,
    CENTRAL_STATE
  );

  // let hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  // let reverseLookupAccount = getNameAccountKeySync(
  //   hashedReverseLookup,
  //   CENTRAL_STATE,
  //   parentAddress
  // );

  let initCentralStateInstruction = new createReverseInstruction({
    name,
  }).getInstruction(
    REGISTRY_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    reverseLookupAccount,
    SYSTEM_PROGRAM,
    CENTRAL_STATE,
    feePayer,
    SYSVAR_RENT_PUBKEY,
    parentAddress,
    parentNameOwner
  );

  let instructions = [initCentralStateInstruction];

  return instructions;
};
