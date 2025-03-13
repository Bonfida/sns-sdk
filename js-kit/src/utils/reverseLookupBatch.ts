import { Address, GetMultipleAccountsApi, Rpc } from "@solana/kit";

import { RegistryState } from "../states/registry";
import { deserializeReverse } from "./deserializers/deserializeReverse";
import { getReverseAddress } from "./getReverseAddress";

/**
 * Perform a batch reverse lookup for given domain addresses.
 *
 * @param {Rpc<GetMultipleAccountsApi>} rpc - The RPC client to interact with the blockchain.
 * @param {Address[]} addresses - The domain addresses to perform the reverse lookup on.
 * @returns {Promise<(string | undefined)[]>} - A list of human-readable domain names associated with the given addresses, or undefined if the data is not available.
 */

export async function reverseLookupBatch(
  rpc: Rpc<GetMultipleAccountsApi>,
  addresses: Address[]
): Promise<(string | undefined)[]> {
  const reverseLookupAddresses: Address[] = await Promise.all(
    addresses.map((address) => getReverseAddress(address))
  );
  const states = await RegistryState.retrieveBatch(rpc, reverseLookupAddresses);

  return states.map((state) => {
    return state?.data ? deserializeReverse(state.data) : undefined;
  });
}
