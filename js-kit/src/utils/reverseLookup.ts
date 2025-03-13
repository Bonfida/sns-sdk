import { Address, GetAccountInfoApi, Rpc } from "@solana/kit";

import { NoAccountDataError } from "../errors";
import { RegistryState } from "../states/registry";
import { deserializeReverse } from "./deserializers/deserializeReverse";
import { getReverseAddress } from "./getReverseAddress";

/**
 * Perform a reverse lookup for a given domain address.
 *
 * @param {Rpc<GetAccountInfoApi>} rpc - The RPC client to interact with the blockchain.
 * @param {Address} address - The domain address to perform the reverse lookup on.
 * @param {Address} [parentAddress] - (Optional) The parent domain address, if applicable.
 * @returns {Promise<string>} - The human-readable domain name associated with the given address.
 * @throws {NoAccountDataError} - If the registry data is empty.
 */

export async function reverseLookup(
  rpc: Rpc<GetAccountInfoApi>,
  address: Address,
  parentAddress?: Address
): Promise<string> {
  const reverseAddress = await getReverseAddress(address, parentAddress);

  const registry = await RegistryState.retrieve(rpc, reverseAddress);
  if (!registry.data) {
    throw new NoAccountDataError("The registry data is empty");
  }

  return deserializeReverse(registry.data, !!parentAddress);
}
