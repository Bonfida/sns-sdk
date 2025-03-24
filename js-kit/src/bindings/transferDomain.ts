import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { TransferInstruction } from "../instructions/transferInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

export async function transferDomain(
  rpc: Rpc<GetAccountInfoApi>,
  domain: string,
  newOwner: Address,
  classAddress?: Address,
  parentAddress?: Address,
  parentOwner?: Address
): Promise<IInstruction> {
  const domainAddress = await deriveAddress(
    domain,
    parentAddress,
    classAddress
  );

  const currentOwner =
    classAddress || (await RegistryState.retrieve(rpc, domainAddress)).owner;

  const transferInstr = new TransferInstruction({ newOwner }).getInstruction(
    NAME_PROGRAM_ADDRESS,
    domainAddress,
    currentOwner,
    classAddress,
    parentAddress,
    parentOwner
  );

  return transferInstr;
}
