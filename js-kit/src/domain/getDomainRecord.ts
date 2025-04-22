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

interface GetDomainRecordParams {
  rpc: Rpc<
    GetAccountInfoApi & GetMultipleAccountsApi & GetTokenLargestAccountsApi
  >;
  domain: string;
  record: Record;
  options?: {
    deserialize?: boolean;
    verifier?: ReadonlyUint8Array;
  };
}

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
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi, GetMultipleAccountsApi, and GetTokenLargestAccountsApi.
 *   - `domain`: The domain whose record is to be retrieved.
 *   - `record`: The type of record to retrieve.
 *   - `options`: (Optional) Additional options for processing:
 *       - `deserialize`: Whether to deserialize the record content.
 *       - `verifier`: A custom verifier for the record.
 * @returns A promise that resolves to the retrieved record, its verification status, and optionally its deserialized content.
 */
export async function getDomainRecord({
  rpc,
  domain,
  record,
  options = {},
}: GetDomainRecordParams): Promise<Result> {
  const [domainOwner, state] = await Promise.all([
    getDomainOwner({ rpc, domain }),
    getRecordV2Address({ domain, record }).then((address) =>
      RecordState.retrieve(rpc, address)
    ),
  ]);

  const verifier = options.verifier || _getDefaultVerifier({ record, state });
  const verified = {
    staleness: _verifyStalenessSync({ domainOwner, state }),
    ...(verifier && {
      rightOfAssociation: _verifyRoaSync({ record, state, verifier }),
    }),
  };

  return {
    record,
    retrievedRecord: state,
    verified,
    ...(options.deserialize && {
      deserializedContent: deserializeRecordContent({
        content: state.getContent(),
        record,
      }),
    }),
  };
}
