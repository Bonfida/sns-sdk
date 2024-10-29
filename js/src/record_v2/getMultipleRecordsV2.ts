import { Record } from "../types/record";
import { Connection } from "@solana/web3.js";
import { Record as SnsRecord } from "@bonfida/sns-records";

import { getRecordV2Key } from "./getRecordV2Key";
import { deserializeRecordV2Content } from "./deserializeRecordV2Content";

interface GetRecordV2Options {
  deserialize?: boolean;
}

export interface RecordResult {
  retrievedRecord: SnsRecord;
  record: Record;
  deserializedContent?: string;
}

/**
 * This function can be used to retrieve multiple records V2 for a given domain
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export async function getMultipleRecordsV2(
  connection: Connection,
  domain: string,
  records: Record[],
  options: GetRecordV2Options = {},
): Promise<(RecordResult | undefined)[]> {
  const pubkeys = records.map((record) => getRecordV2Key(domain, record));
  const retrievedRecords = await SnsRecord.retrieveBatch(connection, pubkeys);

  if (options.deserialize) {
    return retrievedRecords.map((e, idx) => {
      if (!e) return undefined;
      return {
        retrievedRecord: e,
        record: records[idx],
        deserializedContent: deserializeRecordV2Content(
          e.getContent(),
          records[idx],
        ),
      };
    });
  }

  return retrievedRecords.map((e, idx) => {
    if (!e) return undefined;
    return {
      retrievedRecord: e,
      record: records[idx],
    };
  });
}
