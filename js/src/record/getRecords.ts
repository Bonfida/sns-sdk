import { Connection } from "@solana/web3.js";
import { Record } from "../types/record";
import { NameRegistryState } from "../state";
import { getRecordKeySync } from "./getRecordKeySync";
import { deserializeRecord } from "./deserializeRecord";

// Overload signature for the case where deserialize is true.
export async function getRecords(
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize: true,
): Promise<string[]>;

// Overload signature for the case where deserialize is false or undefined.
export async function getRecords(
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize?: false,
): Promise<NameRegistryState[]>;

export async function getRecords(
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize?: boolean,
) {
  const pubkeys = records.map((record) => getRecordKeySync(domain, record));
  const registries = await NameRegistryState.retrieveBatch(connection, pubkeys);

  if (deserialize) {
    return registries.map((e, idx) => {
      if (!e) return undefined;
      return deserializeRecord(
        e,
        records[idx],
        getRecordKeySync(domain, records[idx]),
      );
    });
  }
  return registries;
}
