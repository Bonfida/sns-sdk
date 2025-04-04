import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { UpdateNameRegistryInstruction } from "../instructions/updateNameRegistryInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

export async function updateNameRegistry(
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

  const ix = new UpdateNameRegistryInstruction({
    offset,
    inputDat: data,
  }).getInstruction(NAME_PROGRAM_ADDRESS, domainAddress, signer);

  return ix;
}
