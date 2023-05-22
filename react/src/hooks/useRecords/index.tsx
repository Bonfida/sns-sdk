import { useAsync } from "react-async-hook";
import { Connection } from "@solana/web3.js";
import { Record, getRecords } from "@bonfida/spl-name-service";

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
  records: Record[]
) => {
  return useAsync(async () => {
    const res = await getRecords(connection, domain, records);
    return res;
  }, [domain, ...records]);
};
