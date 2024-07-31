import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_VERIFICATION_AUTHORITY,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { deleteInstruction } from "../instructions/deleteInstruction";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

// Delete the verified registry for a given twitter handle
// Signed by the verified pubkey
export async function deleteTwitterRegistry(
  twitterHandle: string,
  verifiedPubkey: PublicKey,
): Promise<TransactionInstruction[]> {
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const hashedVerifiedPubkey = getHashedNameSync(verifiedPubkey.toString());
  const reverseRegistryKey = getNameAccountKeySync(
    hashedVerifiedPubkey,
    TWITTER_VERIFICATION_AUTHORITY,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const instructions = [
    // Delete the user facing registry
    deleteInstruction(
      NAME_PROGRAM_ID,
      twitterHandleRegistryKey,
      verifiedPubkey,
      verifiedPubkey,
    ),
    // Delete the reverse registry
    deleteInstruction(
      NAME_PROGRAM_ID,
      reverseRegistryKey,
      verifiedPubkey,
      verifiedPubkey,
    ),
  ];

  return instructions;
}
