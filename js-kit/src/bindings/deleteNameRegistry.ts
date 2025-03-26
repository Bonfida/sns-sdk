import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { DeleteNameRegistryInstruction } from "../instructions/deleteNameRegistryInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

export async function deleteNameRegistry(
  rpc: Rpc<GetAccountInfoApi>,
  name: string,
  refundTarget: Address,
  classAddress?: Address,
  parentAddress?: Address
): Promise<IInstruction> {
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
}
