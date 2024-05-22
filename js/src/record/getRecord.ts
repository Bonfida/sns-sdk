import { Connection } from "@solana/web3.js";
import { RECORD_V1_SIZE, Record } from "../types/record";
import { NameRegistryState } from "../state";
import { NoRecordDataError } from "../error";

import { getRecordKeySync } from "./getRecordKeySync";
import { deserializeRecord } from "./deserializeRecord";

// Overload signature for the case where deserialize is true.
export async function getRecord(
  connection: Connection,
  domain: string,
  record: Record,
  deserialize: true,
): Promise<string | undefined>;

// Overload signature for the case where deserialize is false or undefined.
export async function getRecord(
  connection: Connection,
  domain: string,
  record: Record,
  deserialize?: false,
): Promise<NameRegistryState | undefined>;

/**
 * This function can be used to retrieve a specified record for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export async function getRecord(
  connection: Connection,
  domain: string,
  record: Record,
  deserialize?: boolean,
) {
  const pubkey = getRecordKeySync(domain, record);
  let { registry } = await NameRegistryState.retrieve(connection, pubkey);

  if (!registry.data) {
    throw new NoRecordDataError(`The record data is empty`);
  }

  if (deserialize) {
    return deserializeRecord(registry, record, pubkey);
  }
  const recordSize = RECORD_V1_SIZE.get(record);
  registry.data = registry.data.slice(0, recordSize);

  return registry;
}
