import {
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  GetTokenLargestAccountsApi,
  ReadonlyUint8Array,
  Rpc,
} from "@solana/kit";

import { MissingVerifierError } from "../errors";
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
 * Retrieves multiple records under a domain, verifies their state, and optionally deserializes their content.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi, GetMultipleAccountsApi, and GetTokenLargestAccountsApi.
 * @param domain - The domain whose records are to be retrieved.
 * @param records - An array of record types to retrieve.
 * @param options - (Optional) Additional options for processing:
 *   - deserialize: Whether to deserialize the record content.
 *   - verifiers: An array of custom verifiers for the records.
 * @returns A promise that resolves to an array of results for the retrieved records, including their verification status and optionally their deserialized content.
 */
export async function getDomainRecords<
  T extends Record[],
  U extends { [K in keyof T]: ReadonlyUint8Array | undefined },
>(
  rpc: Rpc<
    GetAccountInfoApi & GetMultipleAccountsApi & GetTokenLargestAccountsApi
  >,
  domain: string,
  records: [...T],
  options: {
    deserialize?: boolean;
    verifiers?: [...U];
  } = {}
): Promise<(Result | undefined)[]> {
  const verifiers = options.verifiers;
  if (verifiers && verifiers.length !== records.length) {
    throw new MissingVerifierError(
      "The number of verifiers must be the same as the number of records"
    );
  }

  const [domainOwner, retrievedRecords] = await Promise.all([
    getDomainOwner(rpc, domain),
    Promise.all(
      records.map((record) => getRecordV2Address(domain, record))
    ).then((addresses) => RecordState.retrieveBatch(rpc, addresses)),
  ]);

  return retrievedRecords.map((retrievedRecord, idx) => {
    if (!retrievedRecord) return undefined;

    const record = records[idx];
    const verifier =
      options.verifiers?.[idx] || _getDefaultVerifier(record, retrievedRecord);
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
  });
}
