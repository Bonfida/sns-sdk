import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { DeleteNameRegistryInstruction } from "../instructions/deleteNameRegistryInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

interface DeleteNameRegistryParams {
  rpc: Rpc<GetAccountInfoApi>;
  name: string;
  refundAddress: Address;
  classAddress?: Address;
  parentAddress?: Address;
}

/**
 * Deletes a name registry and refunds the associated rent balance to the specified target.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi.
 *   - `name`: The name of the registry to be deleted.
 *   - `refundTarget`: The address to which the refunded rent balance will be sent.
 *   - `classAddress`: (Optional) The address of the class associated with the registry.
 *   - `parentAddress`: (Optional) The address of the parent registry.
 * @returns A promise which resolves to the delete name registry instruction.
 */
export const deleteNameRegistry = async ({
  rpc,
  name,
  refundAddress,
  classAddress,
  parentAddress,
}: DeleteNameRegistryParams): Promise<IInstruction> => {
  const domainAddress = await deriveAddress(name, parentAddress, classAddress);

  const owner =
    classAddress || (await RegistryState.retrieve(rpc, domainAddress)).owner;

  const ix = new DeleteNameRegistryInstruction().getInstruction(
    NAME_PROGRAM_ADDRESS,
    domainAddress,
    refundAddress,
    owner
  );

  return ix;
};
