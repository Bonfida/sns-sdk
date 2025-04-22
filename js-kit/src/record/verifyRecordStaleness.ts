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
 * @param state - The state of the record to verify.
 * @returns True if the record's staleness validation passes, false otherwise.
 */
export const _verifyStalenessSync = ({
  domainOwner,
  state,
}: {
  domainOwner: Address;
  state: RecordState;
}) => {
  const stalenessId = state.getStalenessId();

  return (
    uint8ArraysEqual(addressCodec.encode(domainOwner), stalenessId) &&
    state.header.stalenessValidation === Validation.Solana
  );
};

interface VerifyRecordStalenessParams {
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>;
  domain: string;
  record: Record;
}

/**
 * Verifies the staleness of a record asynchronously.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: The RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 *   - `domain`: The domain under which the record resides.
 *   - `record`: The record to verify.
 * @returns A promise that resolves to true if the record is stale, false otherwise.
 */
export const verifyRecordStaleness = async ({
  rpc,
  domain,
  record,
}: VerifyRecordStalenessParams): Promise<boolean> => {
  const [domainOwner, state] = await Promise.all([
    getDomainOwner({ rpc, domain }),
    getRecordV2Address({ domain, record }).then((address) =>
      RecordState.retrieve(rpc, address)
    ),
  ]);

  return _verifyStalenessSync({ domainOwner, state });
};
