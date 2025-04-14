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
 * Verifies the staleness of a record synchronously.
 * This is intended for internal use only.
 *
 * @param domainOwner - The address of the domain's owner.
 * @param recordState - The state of the record to verify.
 * @returns True if the record's staleness validation passes, false otherwise.
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
 * Verifies the staleness of a record asynchronously.
 *
 * @param rpc - The RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 * @param domain - The domain under which the record resides.
 * @param record - The record to verify.
 * @returns A promise that resolves to true if the record is stale, false otherwise.
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
