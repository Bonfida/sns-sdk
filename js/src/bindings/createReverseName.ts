import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { createReverseInstruction } from "../instructions/createReverseInstruction";
import {
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  REGISTER_PROGRAM_ID,
  CENTRAL_STATE,
} from "../constants";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

/**
 *
 * @param nameAccount The name account to create the reverse account for
 * @param name The name of the domain
 * @param feePayer The fee payer of the transaction
 * @param parentName The parent name account
 * @param parentNameOwner The parent name owner
 * @returns
 */
export const createReverseName = async (
  nameAccount: PublicKey,
  name: string,
  feePayer: PublicKey,
  parentName?: PublicKey,
  parentNameOwner?: PublicKey,
) => {
  let hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  let reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    CENTRAL_STATE,
    parentName,
  );

  let initCentralStateInstruction = new createReverseInstruction({
    name,
  }).getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    reverseLookupAccount,
    SystemProgram.programId,
    CENTRAL_STATE,
    feePayer,
    SYSVAR_RENT_PUBKEY,
    parentName,
    parentNameOwner,
  );

  let instructions = [initCentralStateInstruction];

  return instructions;
};
