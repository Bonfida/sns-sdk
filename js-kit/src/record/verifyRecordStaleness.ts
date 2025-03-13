import {
  Address,
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
} from "@solana/kit";

import { addressCodec } from "../codecs";
import { getDomainOwner } from "../domain/getDomainOwner";
import { getRecordV2Address } from "../record/getRecordV2Address";
import { RecordState } from "../states/record";
import { Record } from "../types/record";
import { Validation } from "../types/validation";
import { uint8ArraysEqual } from "../utils/uint8Array/uint8ArraysEqual";

/**
 * Verifies the staleness of a record synchronously using owner address
 * and record state.
 * This function is intended for internal use only.
 * @param {Address} domainOwner - The owner address.
 * @param {RecordState} recordState - The retrieved record state.
 * @returns {boolean} - True if the record is stale, false otherwise.
 */
export const _verifyStalenessSync = (
  domainOwner: Address,
  recordState: RecordState
) => {
  const stalenessId = recordState.getStalenessId();

  return (
    uint8ArraysEqual(addressCodec.encode(domainOwner), stalenessId) &&
    recordState.header.stalenessValidation === Validation.Solana
  );
};

/**
 * Verifies the staleness of a record asynchronously
 * @param {Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>} rpc - The RPC instance
 *     to interact with the blockchain.
 * @param {string} domain - The domain to check.
 * @param {Record} record - The record to verify.
 * @returns {Promise<boolean>} - A promise that resolves to true if the record is stale,
 *     false otherwise.
 */
export const verifyRecordStaleness = async (
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>,
  domain: string,
  record: Record
) => {
  const [domainOwner, retrievedRecord] = await Promise.all([
    getDomainOwner(rpc, domain),
    getRecordV2Address(domain, record).then((address) =>
      RecordState.retrieve(rpc, address)
    ),
  ]);

  return _verifyStalenessSync(domainOwner, retrievedRecord);
};
