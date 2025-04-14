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
 * This is an internal utility function.
 *
 * @param record - The record whose verifier is to be determined.
 * @param recordState - The state of the record.
 * @returns The default verifier as a ReadonlyUint8Array or undefined if no verifier is found.
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
 * Verifies the right of association for a record synchronously.
 * This function is intended for internal use only.
 *
 * @param record - The record to verify.
 * @param recordState - The state of the record.
 * @param verifier - The verifier for the record.
 * @returns True if the association is valid, false otherwise.
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
 * Verifies the right of association for a record asynchronously.
 *
 * @param rpc - The RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 * @param domain - The domain under which the record resides.
 * @param record - The record to verify.
 * @param verifier - (Optional) The verifier for the record. If not specified, a default verifier is derived.
 * @returns A promise that resolves to true if the association is valid, false otherwise.
 * @throws MissingVerifierError - If no verifier is specified and no default verifier is found.
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
