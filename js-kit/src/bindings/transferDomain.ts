import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { TransferInstruction } from "../instructions/transferInstruction";
import { RegistryState } from "../states/registry";
import { deriveAddress } from "../utils/deriveAddress";

/**
 * Transfers a domain to a new owner.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi.
 * @param domain - The name of the domain to be transferred.
 * @param newOwner - The address of the new owner of the domain.
 * @param classAddress - (Optional) The address of the class associated with the domain.
 * @param parentAddress - (Optional) The address of the parent domain.
 * @param parentOwner - (Optional) The address of the parent domain owner.
 * @returns A promise that resolves to the transfer domain instruction.
 */
export const transferDomain = async (
  rpc: Rpc<GetAccountInfoApi>,
  domain: string,
  newOwner: Address,
  classAddress?: Address,
  parentAddress?: Address,
  parentOwner?: Address
): Promise<IInstruction> => {
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
};
