import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { DeleteNameRegistryInstruction } from "../instructions/deleteNameRegistryInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

/**
 * Deletes a name registry and refunds the associated rent balance to the specified target.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi.
 * @param name - The name of the registry to be deleted.
 * @param refundTarget - The address to which the refunded rent balance will be sent.
 * @param classAddress - (Optional) The address of the class associated with the registry.
 * @param parentAddress - (Optional) The address of the parent registry.
 * @returns A promise which resolves to the delete name registry instruction.
 */
export const deleteNameRegistry = async (
  rpc: Rpc<GetAccountInfoApi>,
  name: string,
  refundTarget: Address,
  classAddress?: Address,
  parentAddress?: Address
): Promise<IInstruction> => {
  const domainAddress = await deriveAddress(name, parentAddress, classAddress);

  const owner =
    classAddress || (await RegistryState.retrieve(rpc, domainAddress)).owner;

  const ix = new DeleteNameRegistryInstruction().getInstruction(
    NAME_PROGRAM_ADDRESS,
    domainAddress,
    refundTarget,
    owner
  );

  return ix;
};
