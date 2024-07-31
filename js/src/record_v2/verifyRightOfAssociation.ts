import { Record } from "../types/record";
import { MissingVerifierError } from "../error";
import { Connection } from "@solana/web3.js";
import { Record as SnsRecord, Validation } from "@bonfida/sns-records";

import { getRecordV2Key } from "./getRecordV2Key";
import { ETH_ROA_RECORDS, GUARDIANS } from "./const";

/**
 *
 * This function verifies the right of association of a record.
 * Note: This function does not verify if the record is stale.
 * Users must verify staleness in addition to the right of association.
 * @param {Connection} connection - The Solana RPC connection object
 * @param {Record} record - The record to be verified.
 * @param {string} domain - The domain associated with the record.
 * @param {Buffer} verifier - The optional verifier to be used in the verification process.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating whether the record has the right of association.
 */
export const verifyRightOfAssociation = async (
  connection: Connection,
  record: Record,
  domain: string,
  verifier?: Buffer,
) => {
  const recordKey = getRecordV2Key(domain, record);
  const recordObj = await SnsRecord.retrieve(connection, recordKey);

  const roaId = recordObj.getRoAId();

  const validation = ETH_ROA_RECORDS.has(record)
    ? Validation.Ethereum
    : Validation.Solana;

  verifier = verifier ?? GUARDIANS.get(record)?.toBuffer();
  if (!verifier) {
    throw new MissingVerifierError("You must specify the verifier");
  }

  return (
    verifier.compare(roaId) === 0 &&
    recordObj.header.rightOfAssociationValidation === validation
  );
};
