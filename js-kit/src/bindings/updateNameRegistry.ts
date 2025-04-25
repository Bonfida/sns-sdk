import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { UpdateNameRegistryInstruction } from "../instructions/updateNameRegistryInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

export interface UpdateNameRegistryParams {
  rpc: Rpc<GetAccountInfoApi>;
  domain: string;
  offset: number;
  data: Uint8Array;
  classAddress?: Address;
  parentAddress?: Address;
}

/**
 * Update the data of the given name registry.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi.
 *   - `domain`: The name of the domain whose registry will be updated.
 *   - `offset`: The offset in bytes where the update should begin.
 *   - `data`: The data to be written to the registry.
 *   - `classAddress`: (Optional) The address of the class associated with the registry.
 *   - `parentAddress`: (Optional) The address of the parent registry.
 * @returns A promise that resolves to the update name registry instruction.
 */
export async function updateNameRegistry({
  rpc,
  domain,
  offset,
  data,
  classAddress,
  parentAddress,
}: UpdateNameRegistryParams): Promise<IInstruction> {
  const domainAddress = await deriveAddress(
    domain,
    parentAddress,
    classAddress
  );

  const signer =
    classAddress || (await RegistryState.retrieve(rpc, domainAddress)).owner;

  const ix = new UpdateNameRegistryInstruction({
    offset,
    inputDat: data,
  }).getInstruction(NAME_PROGRAM_ADDRESS, domainAddress, signer);

  return ix;
}
