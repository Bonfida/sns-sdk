import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_VERIFICATION_AUTHORITY,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { createInstruction } from "../instructions/createInstruction";
import { NameRegistryState } from "../state";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";
import { Numberu32, Numberu64 } from "../int";

import { createReverseTwitterRegistry } from "./createReverseTwitterRegistry";

// Signed by the authority, the payer and the verified pubkey
export async function createVerifiedTwitterRegistry(
  connection: Connection,
  twitterHandle: string,
  verifiedPubkey: PublicKey,
  space: number, // The space that the user will have to write data into the verified registry
  payerKey: PublicKey,
): Promise<TransactionInstruction[]> {
  // Create user facing registry
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
  );

  let instructions = [
    createInstruction(
      NAME_PROGRAM_ID,
      SystemProgram.programId,
      twitterHandleRegistryKey,
      verifiedPubkey,
      payerKey,
      hashedTwitterHandle,
      new Numberu64(lamports),
      new Numberu32(space),
      undefined,
      TWITTER_ROOT_PARENT_REGISTRY_KEY,
      TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as owner of the parent for all user-facing registries
    ),
  ];

  instructions = instructions.concat(
    await createReverseTwitterRegistry(
      connection,
      twitterHandle,
      twitterHandleRegistryKey,
      verifiedPubkey,
      payerKey,
    ),
  );

  return instructions;
}
