import { Connection } from "@solana/web3.js";
import { Record } from "@bonfida/spl-name-service";
import { useDeserializedRecords } from "../useRecords";
import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";

/**
 * Returns the profile picture URI for the given domain
 * @param connection The Solana RPC connection object
 * @param domain The domain to fetch the profile picture for
 * @returns The picture URI
 */
export const useProfilePic = (connection: Connection, domain: string) => {
  return useDeserializedRecords(connection, domain, [Record.Pic]);
};
