import { MaybeRef, unref } from "vue";
import { Connection } from "@solana/web3.js";
import { Record, getRecords } from "@bonfida/spl-name-service";
import { useLoadingFactory } from "@/utils/use-loading-factory";

/**
 * Returns the records of the given domain names
 * @param connection The Solana RPC connection object
 * @param domain The domain name
 * @param records The list of records to fetch
 * @returns Returns a list of records' content
 * @example
 * const { result } = useRecords(connection, 'domain', [Record.SOL, Record.BTC]);
 */
export const useRecords = (
  connection: MaybeRef<Connection>,
  domain: MaybeRef<string>,
  records: MaybeRef<Record[]>,
) => {
  return useLoadingFactory(
    async () => {
      return getRecords(
        unref(connection),
        unref(domain),
        unref(records),
        false,
      );
    },
    () => [unref(domain), unref(records), unref(connection)],
  );
};

/**
 * Returns the deserialized records of the given domain names
 * @param connection The Solana RPC connection object
 * @param domain The domain name
 * @param records The list of records to fetch
 * @returns Returns a list of records' content
 * @example
 * const { result } = useDeserializedRecords(connection, 'domain', [Record.SOL, Record.BTC]);
 */
export const useDeserializedRecords = (
  connection: MaybeRef<Connection>,
  domain: MaybeRef<string>,
  records: MaybeRef<Record[]>,
) => {
  return useLoadingFactory(
    async () => {
      return getRecords(unref(connection), unref(domain), unref(records), true);
    },
    () => [unref(connection), unref(domain), unref(records)],
  );
};
