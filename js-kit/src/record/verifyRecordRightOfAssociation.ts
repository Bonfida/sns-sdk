import {
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  ReadonlyUint8Array,
  Rpc,
} from "@solana/kit";

import { addressCodec } from "../codecs";
import {
  ETH_ROA_RECORDS,
  GUARDIANS,
  SELF_SIGNED_RECORDS,
} from "../constants/records";
import { MissingVerifierError } from "../errors";
import { getRecordV2Address } from "../record/getRecordV2Address";
import { RecordState } from "../states/record";
import { Record } from "../types/record";
import { Validation } from "../types/validation";
import { uint8ArraysEqual } from "../utils/uint8Array/uint8ArraysEqual";

/**
 * Gets the default verifier for a given record and record state.
 * This function is intended for internal use only.
 * @param {Record} record - The record to verify.
 * @param {RecordState} recordState - The state of the record.
 * @returns {ReadonlyUint8Array | undefined} - The default verifier or undefined if not found.
 */
export const _getDefaultVerifier = (
  record: Record,
  recordState: RecordState
) => {
  if (SELF_SIGNED_RECORDS.has(record)) {
    return recordState.getContent();
  } else {
    const guardian = GUARDIANS.get(record);
    if (guardian) {
      return addressCodec.encode(guardian);
    }
  }
  return undefined;
};

/**
 * Verifies the right of association of a record synchronously.
 * This function is intended for internal use only.
 * @param {Record} record - The record to verify.
 * @param {RecordState} recordState - The state of the record.
 * @param {ReadonlyUint8Array} verifier - The verifier for the record.
 * @returns {boolean} - True if the right of association is valid, false otherwise.
 */
export const _verifyRoaSync = (
  record: Record,
  recordState: RecordState,
  verifier: ReadonlyUint8Array
) => {
  const roaId = recordState.getRoAId();

  const validation = ETH_ROA_RECORDS.has(record)
    ? Validation.Ethereum
    : Validation.Solana;

  return (
    uint8ArraysEqual(roaId, verifier) &&
    recordState.header.rightOfAssociationValidation === validation
  );
};

/**
 * Verifies the right of association of a record asynchronously.
 * @param {Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>} rpc - The RPC instance
 *     to interact with the blockchain.
 * @param {string} domain - The domain to check.
 * @param {Record} record - The record to verify.
 * @param {ReadonlyUint8Array} [verifier] - The optional verifier for the record.
 * @returns {Promise<boolean>} - A promise that resolves to true if the right of association
 *     is valid, false otherwise.
 * @throws {MissingVerifierError} - If the verifier is not specified and no default verifier
 *     is found.
 */
export const verifyRecordRightOfAssociation = async (
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>,
  domain: string,
  record: Record,
  verifier?: ReadonlyUint8Array
) => {
  const address = await getRecordV2Address(domain, record);
  const retrievedRecord = await RecordState.retrieve(rpc, address);

  verifier = verifier || _getDefaultVerifier(record, retrievedRecord);
  if (!verifier) {
    throw new MissingVerifierError("You must specify the verifier");
  }

  return _verifyRoaSync(record, retrievedRecord, verifier);
};
