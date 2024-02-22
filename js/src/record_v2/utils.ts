import { Connection, PublicKey } from "@solana/web3.js";
import { Record } from "../types/record";
import { getRecordV2Key } from ".";
import { Record as SnsRecord, Validation } from "@bonfida/sns-records";
import { NameRegistryState } from "../state";
import { getDomainKeySync } from "../utils";

/**
 * This function verifies the staleness of a record.
 * @param {Connection} connection - The Solana RPC connection object
 * @param {Record} record - The record to be verified.
 * @param {string} domain - The domain associated with the record.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating whether the record is stale.
 */
export const verifyStaleness = async (
  connection: Connection,
  record: Record,
  domain: string,
) => {
  const recordKey = getRecordV2Key(domain, record);
  const { registry, nftOwner } = await NameRegistryState.retrieve(
    connection,
    getDomainKeySync(domain).pubkey,
  );
  const owner = nftOwner || registry.owner;
  const recordObj = await SnsRecord.retrieve(connection, recordKey);

  const stalenessId = recordObj.getStalenessId();

  return (
    owner?.equals(new PublicKey(stalenessId)) &&
    recordObj.header.stalenessValidation === Validation.Solana
  );
};
