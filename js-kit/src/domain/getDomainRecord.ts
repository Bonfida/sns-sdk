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
