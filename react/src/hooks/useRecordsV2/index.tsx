import { Options } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { Connection } from "@solana/web3.js";
import {
  Record,
  RecordResult,
  getMultipleRecordsV2,
} from "@bonfida/spl-name-service";

/**
 * Returns the deserialized (or not) records V2 of the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The domain name
 * @param records The list of records to fetch
 * @param deserialize Whether to deserialize the record content or not. Deserialization is done according to SNS IP-1
 * @returns Returns a list of records' content
 */
export const useRecordsV2 = (
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize: boolean,
  options: Options<(RecordResult | undefined)[]> = {
    queryKey: ["useRecordsV2", domain, ...records, deserialize],
  },
) => {
  return useQuery({
    ...options,
    queryFn: async () => {
      const res = await getMultipleRecordsV2(connection, domain, records, {
        deserialize,
      });
      return res;
    },
  });
};
