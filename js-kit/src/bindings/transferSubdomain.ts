import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidSubdomainError } from "../errors";
import { TransferInstruction } from "../instructions/transferInstruction";
import { RegistryState } from "../states/registry";

/**
 * Transfers a subdomain to a new owner.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi.
 * @param subdomain - The subdomain to transfer. This can include or omit the .sol suffix
 *   (e.g., 'something.sns.sol' or 'something.sns').
 * @param newOwner - The address of the new owner.
 * @param isParentOwnerSigner - (Optional) Specifies if the parent domain owner is a signer
 *   for this transaction.
 * @param currentOwner - (Optional) The current owner of the subdomain. If not provided, it
 *   will be resolved automatically. This is useful for building transactions when the subdomain
 *   does not yet exist.
 * @returns A promise that resolves to the transfer subdomain instruction.
 */

export const transferSubdomain = async (
  rpc: Rpc<GetAccountInfoApi>,
  subdomain: string,
  newOwner: Address,
  isParentOwnerSigner?: boolean,
  currentOwner?: Address
): Promise<IInstruction> => {
  const {
    address: domainAddress,
    isSub,
    parentAddress: _parentAddress,
  } = await getDomainAddress(subdomain);

  if (!isSub || !_parentAddress) {
    throw new InvalidSubdomainError("The subdomain is not valid");
  }

  if (!currentOwner) {
    const registry = await RegistryState.retrieve(rpc, domainAddress);
    currentOwner = registry.owner;
  }

  let parentAddress: Address | undefined = undefined;
  let parentOwner: Address | undefined = undefined;

  if (isParentOwnerSigner) {
    parentAddress = _parentAddress;
    parentOwner = (await RegistryState.retrieve(rpc, _parentAddress)).owner;
  }

  const ix = new TransferInstruction({ newOwner }).getInstruction(
    NAME_PROGRAM_ADDRESS,
    domainAddress,
    currentOwner,
    undefined,
    parentAddress,
    parentOwner
  );

  return ix;
};
