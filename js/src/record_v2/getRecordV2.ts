import { Record } from "../types/record";
import { Connection } from "@solana/web3.js";
import { Record as SnsRecord } from "@bonfida/sns-records";

import { getRecordV2Key } from "./getRecordV2Key";
import { deserializeRecordV2Content } from "./deserializeRecordV2Content";

interface GetRecordV2Options {
  deserialize?: boolean;
}

interface RecordResult {
  retrievedRecord: SnsRecord;
  record: Record;
  deserializedContent?: string;
}

type SingleRecordResult = Omit<RecordResult, "record">;

/**
 * This function can be used to retrieve a specified record V2 for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export async function getRecordV2(
  connection: Connection,
  domain: string,
  record: Record,
  options: GetRecordV2Options = {},
): Promise<SingleRecordResult> {
  const pubkey = getRecordV2Key(domain, record);
  const retrievedRecord = await SnsRecord.retrieve(connection, pubkey);

  if (options.deserialize) {
    return {
      retrievedRecord,
      deserializedContent: deserializeRecordV2Content(
        retrievedRecord.getContent(),
        record,
      ),
    };
  }

  return { retrievedRecord };
}
