import { Address, GetMultipleAccountsApi, Rpc } from "@solana/kit";

import { RegistryState } from "../states/registry";
import { deserializeReverse } from "./deserializers/deserializeReverse";
import { getReverseAddressFromDomainAddress } from "./getReverseAddressFromDomainAddress";

interface ReverseLookupBatchParams {
  rpc: Rpc<GetMultipleAccountsApi>;
  domainAddresses: Address[];
}

/**
 * Perform a batch reverse lookup for given domain addresses.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: The RPC client to interact with the blockchain.
 *   - `addresses`: The domain addresses to perform the reverse lookup on.
 * @returns A promise that resolves to a list of human-readable domain names associated with the given addresses,
 *          or undefined if the data is not available.
 */
export async function reverseLookupBatch({
  rpc,
  domainAddresses,
}: ReverseLookupBatchParams): Promise<(string | undefined)[]> {
  const reverseLookupAddresses: Address[] = await Promise.all(
    domainAddresses.map((domainAddress) =>
      getReverseAddressFromDomainAddress({ domainAddress })
    )
  );
  const states = await RegistryState.retrieveBatch(rpc, reverseLookupAddresses);

  return states.map((state) => {
    return state?.data ? deserializeReverse({ data: state.data }) : undefined;
  });
}
