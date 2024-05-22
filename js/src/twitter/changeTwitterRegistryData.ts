import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { updateInstruction } from "../instructions/updateInstruction";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";
import { Numberu32 } from "../int";

// Overwrite the data that is written in the user facing registry
// Signed by the verified pubkey
export async function changeTwitterRegistryData(
  twitterHandle: string,
  verifiedPubkey: PublicKey,
  offset: number, // The offset at which to write the input data into the NameRegistryData
  input_data: Buffer,
): Promise<TransactionInstruction[]> {
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const instructions = [
    updateInstruction(
      NAME_PROGRAM_ID,
      twitterHandleRegistryKey,
      new Numberu32(offset),
      input_data,
      verifiedPubkey,
    ),
  ];

  return instructions;
}
