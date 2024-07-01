import { PublicKey } from "@solana/web3.js";
import { NAME_PROGRAM_ID } from "../constants";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { Record, RecordVersion } from "../types/record";
import { SNS_RECORDS_ID, deleteRecord } from "@bonfida/sns-records";
import { InvalidParrentError } from "../error";

/**
 * This function deletes a record v2 and returns the rent to the fee payer
 * @param domain The .sol domain name
 * @param record  The record type enum
 * @param owner The owner of the record to delete
 * @param payer The fee payer of the transaction
 * @returns The delete transaction instruction
 */
export const deleteRecordV2 = (
  domain: string,
  record: Record,
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

  const ix = deleteRecord(
    payer,
    parent,
    owner,
    pubkey,
    NAME_PROGRAM_ID,
    SNS_RECORDS_ID,
  );
  return ix;
};
