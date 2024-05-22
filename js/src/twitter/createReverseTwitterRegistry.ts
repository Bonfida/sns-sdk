import { serialize } from "borsh";
import { Buffer } from "buffer";
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
import { updateInstruction } from "../instructions/updateInstruction";
import { NameRegistryState } from "../state";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";
import { Numberu32, Numberu64 } from "../int";
import { ReverseTwitterRegistryState } from "./ReverseTwitterRegistryState";

export async function createReverseTwitterRegistry(
  connection: Connection,
  twitterHandle: string,
  twitterRegistryKey: PublicKey,
  verifiedPubkey: PublicKey,
  payerKey: PublicKey,
): Promise<TransactionInstruction[]> {
  // Create the reverse lookup registry
  const hashedVerifiedPubkey = getHashedNameSync(verifiedPubkey.toString());
  const reverseRegistryKey = getNameAccountKeySync(
    hashedVerifiedPubkey,
    TWITTER_VERIFICATION_AUTHORITY,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );
  let reverseTwitterRegistryStateBuff = serialize(
    ReverseTwitterRegistryState.schema,
    new ReverseTwitterRegistryState({
      twitterRegistryKey: twitterRegistryKey.toBytes(),
      twitterHandle,
    }),
  );
  return [
    createInstruction(
      NAME_PROGRAM_ID,
      SystemProgram.programId,
      reverseRegistryKey,
      verifiedPubkey,
      payerKey,
      hashedVerifiedPubkey,
      new Numberu64(
        await connection.getMinimumBalanceForRentExemption(
          reverseTwitterRegistryStateBuff.length + NameRegistryState.HEADER_LEN,
        ),
      ),
      new Numberu32(reverseTwitterRegistryStateBuff.length),
      TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as class for all reverse-lookup registries
      TWITTER_ROOT_PARENT_REGISTRY_KEY, // Reverse registries are also children of the root
      TWITTER_VERIFICATION_AUTHORITY,
    ),
    updateInstruction(
      NAME_PROGRAM_ID,
      reverseRegistryKey,
      new Numberu32(0),
      Buffer.from(reverseTwitterRegistryStateBuff),
      TWITTER_VERIFICATION_AUTHORITY,
    ),
  ];
}
