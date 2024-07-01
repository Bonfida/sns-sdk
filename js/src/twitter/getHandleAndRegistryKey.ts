import { Connection, PublicKey } from "@solana/web3.js";
import {
  TWITTER_VERIFICATION_AUTHORITY,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";
import { ReverseTwitterRegistryState } from "./ReverseTwitterRegistryState";

export async function getHandleAndRegistryKey(
  connection: Connection,
  verifiedPubkey: PublicKey,
): Promise<[string, PublicKey]> {
  const hashedVerifiedPubkey = getHashedNameSync(verifiedPubkey.toString());
  const reverseRegistryKey = getNameAccountKeySync(
    hashedVerifiedPubkey,
    TWITTER_VERIFICATION_AUTHORITY,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  let reverseRegistryState = await ReverseTwitterRegistryState.retrieve(
    connection,
    reverseRegistryKey,
  );
  return [
    reverseRegistryState.twitterHandle,
    new PublicKey(reverseRegistryState.twitterRegistryKey),
  ];
}
