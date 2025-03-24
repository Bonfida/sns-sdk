import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { UpdateRegistryInstruction } from "../instructions/updateRegistryInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

export async function updateRegistry(
  rpc: Rpc<GetAccountInfoApi>,
  domain: string,
  offset: number,
  data: Uint8Array,
  classAddress?: Address,
  parentAddress?: Address
): Promise<IInstruction> {
  const domainAddress = await deriveAddress(
    domain,
    parentAddress,
    classAddress
  );

  const signer =
    classAddress || (await RegistryState.retrieve(rpc, domainAddress)).owner;

  const ix = new UpdateRegistryInstruction({
    offset,
    inputDat: data,
  }).getInstruction(NAME_PROGRAM_ADDRESS, domainAddress, signer);

  return ix;
}
