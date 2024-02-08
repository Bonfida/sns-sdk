import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { Connection } from "@solana/web3.js";
import {
  NameRegistryState,
  Record,
  getRecords,
} from "@bonfida/spl-name-service";

/**
 * Returns the records of the given domain names
 * @param connection The Solana RPC connection object
 * @param domain The domain name
 * @param records The list of records to fetch
 * @returns Returns a list of records' content
 */
export const useRecords = (
  connection: Connection,
  domain: string,
  records: Record[],
  options: Options<NameRegistryState[]> = {
    queryKey: ["useRecords", domain, ...records],
  },
) => {
  return useQuery({
    ...options,
    queryFn: async () => {
      const res = await getRecords(connection, domain, records, false);
      return res;
    },
  });
};

/**
 * Returns the deserialized records of the given domain names
 * @param connection The Solana RPC connection object
 * @param domain The domain name
 * @param records The list of records to fetch
 * @returns Returns a list of records' content
 */
export const useDeserializedRecords = (
  connection: Connection,
  domain: string,
  records: Record[],
  options: Options<string[]> = {
    queryKey: ["useDeserializedRecords", domain, ...records],
  },
) => {
  return useQuery({
    ...options,
    queryFn: async () => {
      const res = await getRecords(connection, domain, records, true);
      return res;
    },
  });
};
