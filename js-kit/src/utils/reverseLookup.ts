import { Address, GetAccountInfoApi, Rpc } from "@solana/kit";

import { NoAccountDataError } from "../errors";
import { RegistryState } from "../states/registry";
import { deserializeReverse } from "./deserializers/deserializeReverse";
import { getReverseAddressFromDomainAddress } from "./getReverseAddressFromDomainAddress";

interface ReverseLookupParams {
  rpc: Rpc<GetAccountInfoApi>;
  domainAddress: Address;
  parentAddress?: Address;
}

/**
 * Perform a reverse lookup for a given domain address.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: The RPC client to interact with the blockchain.
 *   - `address`: The domain address to perform the reverse lookup on.
 *   - `parentAddress`: (Optional) The parent domain address, if applicable.
 * @returns A promise that resolves to the human-readable domain name associated with the given address.
 * @throws {NoAccountDataError} If the registry data is empty.
 */
export async function reverseLookup({
  rpc,
  domainAddress,
  parentAddress,
}: ReverseLookupParams): Promise<string> {
  const reverseAddress = await getReverseAddressFromDomainAddress({
    domainAddress,
    parentAddress,
  });

  const registry = await RegistryState.retrieve(rpc, reverseAddress);
  if (!registry.data) {
    throw new NoAccountDataError("The registry data is empty");
  }

  return deserializeReverse({
    data: registry.data,
    trimFirstNullByte: !!parentAddress,
  });
}
