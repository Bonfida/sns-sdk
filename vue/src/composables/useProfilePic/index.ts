import { MaybeRef, unref } from "vue";
import { Connection } from "@solana/web3.js";
import { Record } from "@bonfida/spl-name-service";
import { useDeserializedRecords } from "../useRecords";

/**
 * Returns the profile picture URI for the given domain
 * @param connection The Solana RPC connection object
 * @param domain The domain to fetch the profile picture for
 * @returns The picture URI
 * @example
 * const { result } = useProfilePic(connection, 'domain');
 */
export const useProfilePic = (
  connection: MaybeRef<Connection>,
  domain: MaybeRef<string>,
) => {
  const record = useDeserializedRecords(connection, domain, [Record.Pic]);
  const { result, ...rest } = record;

  return {
    result: Array.isArray(result) ? result[0] : result,
    ...rest,
  };
};
