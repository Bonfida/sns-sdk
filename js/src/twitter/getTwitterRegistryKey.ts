import { PublicKey } from "@solana/web3.js";
import { TWITTER_ROOT_PARENT_REGISTRY_KEY } from "../constants";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

// Returns the key of the user-facing registry
export async function getTwitterRegistryKey(
  twitter_handle: string,
): Promise<PublicKey> {
  const hashedTwitterHandle = getHashedNameSync(twitter_handle);
  return getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );
}
