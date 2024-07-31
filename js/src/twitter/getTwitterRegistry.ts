import { Connection } from "@solana/web3.js";
import { TWITTER_ROOT_PARENT_REGISTRY_KEY } from "../constants";
import { NameRegistryState } from "../state";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

export async function getTwitterRegistry(
  connection: Connection,
  twitter_handle: string,
): Promise<NameRegistryState> {
  const hashedTwitterHandle = getHashedNameSync(twitter_handle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );
  const { registry } = await NameRegistryState.retrieve(
    connection,
    twitterHandleRegistryKey,
  );
  return registry;
}
