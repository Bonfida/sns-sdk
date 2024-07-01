import { PublicKey } from "@solana/web3.js";
import { NAME_PROGRAM_ID } from "../constants";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { Record, RecordVersion } from "../types/record";
import { serializeRecordV2Content } from "../record_v2/serializeRecordV2Content";
import { editRecord, SNS_RECORDS_ID } from "@bonfida/sns-records";
import { InvalidParrentError } from "../error";

/**
 * This function updates the content of a record V2. The data serialization follows the SNS-IP 1 guidelines
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record enum object
 * @param recordV2 The `RecordV2` object to serialize into the record
 * @param owner The owner of the record/domain
 * @param payer The fee payer of the transaction
 * @returns The update record instructions
 */
export const updateRecordV2Instruction = (
  domain: string,
  record: Record,
  content: string,
  owner: PublicKey,
  payer: PublicKey,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new InvalidParrentError("Parent could not be found");
  }

  const ix = editRecord(
    payer,
    pubkey,
    parent,
    owner,
    NAME_PROGRAM_ID,
    `\x02`.concat(record as string),
    serializeRecordV2Content(content, record),
    SNS_RECORDS_ID,
  );

  return ix;
};
