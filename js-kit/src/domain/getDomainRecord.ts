import {
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  GetTokenLargestAccountsApi,
  ReadonlyUint8Array,
  Rpc,
} from "@solana/kit";

import { getRecordV2Address } from "../record/getRecordV2Address";
import {
  _getDefaultVerifier,
  _verifyRoaSync,
} from "../record/verifyRecordRightOfAssociation";
import { _verifyStalenessSync } from "../record/verifyRecordStaleness";
import { RecordState } from "../states/record";
import { Record } from "../types/record";
import { deserializeRecordContent } from "../utils/deserializers/deserializeRecordContent";
import { getDomainOwner } from "./getDomainOwner";

interface Result {
  record: Record;
  retrievedRecord: RecordState;
  verified: {
    staleness: boolean;
    roa?: boolean;
  };
  deserializedContent?: string;
}

/**
 * Retrieves a specific record under a domain, verifies its state, and optionally deserializes its content.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi, GetMultipleAccountsApi, and GetTokenLargestAccountsApi.
 * @param domain - The domain whose record is to be retrieved.
 * @param record - The type of record to retrieve.
 * @param options - (Optional) Additional options for processing:
 *   - deserialize: Whether to deserialize the record content.
 *   - verifier: A custom verifier for the record.
 * @returns A promise that resolves to the retrieved record, its verification status, and optionally its deserialized content.
 */
export async function getDomainRecord(
  rpc: Rpc<
    GetAccountInfoApi & GetMultipleAccountsApi & GetTokenLargestAccountsApi
  >,
  domain: string,
  record: Record,
  options: {
    deserialize?: boolean;
    verifier?: ReadonlyUint8Array;
  } = {}
): Promise<Result> {
  const [domainOwner, retrievedRecord] = await Promise.all([
    getDomainOwner(rpc, domain),
    getRecordV2Address(domain, record).then((address) =>
      RecordState.retrieve(rpc, address)
    ),
  ]);

  const verifier =
    options.verifier || _getDefaultVerifier(record, retrievedRecord);
  const verified = {
    staleness: _verifyStalenessSync(domainOwner, retrievedRecord),
    ...(verifier && {
      rightOfAssociation: _verifyRoaSync(record, retrievedRecord, verifier),
    }),
  };

  return {
    record,
    retrievedRecord,
    verified,
    ...(options.deserialize && {
      deserializedContent: deserializeRecordContent(
        retrievedRecord.getContent(),
        record
      ),
    }),
  };
}
