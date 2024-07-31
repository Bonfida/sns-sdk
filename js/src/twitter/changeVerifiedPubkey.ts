import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_VERIFICATION_AUTHORITY,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { deleteNameRegistry } from "../bindings/deleteNameRegistry";
import { transferInstruction } from "../instructions/transferInstruction";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";
import { createReverseTwitterRegistry } from "./createReverseTwitterRegistry";

// Change the verified pubkey for a given twitter handle
// Signed by the Authority, the verified pubkey and the payer
export async function changeVerifiedPubkey(
  connection: Connection,
  twitterHandle: string,
  currentVerifiedPubkey: PublicKey,
  newVerifiedPubkey: PublicKey,
  payerKey: PublicKey,
): Promise<TransactionInstruction[]> {
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  // Transfer the user-facing registry ownership
  let instructions = [
    transferInstruction(
      NAME_PROGRAM_ID,
      twitterHandleRegistryKey,
      newVerifiedPubkey,
      currentVerifiedPubkey,
      undefined,
    ),
  ];

  instructions.push(
    await deleteNameRegistry(
      connection,
      currentVerifiedPubkey.toString(),
      payerKey,
      TWITTER_VERIFICATION_AUTHORITY,
      TWITTER_ROOT_PARENT_REGISTRY_KEY,
    ),
  );

  // Create the new reverse registry
  instructions = instructions.concat(
    await createReverseTwitterRegistry(
      connection,
      twitterHandle,
      twitterHandleRegistryKey,
      newVerifiedPubkey,
      payerKey,
    ),
  );

  return instructions;
}
