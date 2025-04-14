import {
  Address,
  GetAccountInfoApi,
  GetMinimumBalanceForRentExemptionApi,
  IInstruction,
  Rpc,
} from "@solana/kit";

import {
  NAME_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { createNameRegistryInstruction } from "../instructions/createNameRegistryInstruction";
import { RegistryState } from "../states/registry";
import { _generateHash, _getAddressFromHash } from "../utils/deriveAddress";

/**
 * Creates a name registry with the given rent budget, allocated space, owner, and class.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi and GetMinimumBalanceForRentExemptionApi.
 * @param name - The name of the new account.
 * @param space - The space in bytes allocated to the account.
 * @param payer - The allocation cost payer.
 * @param owner - The address to be set as the owner of the new name account.
 * @param lamports - (Optional) The budget to be set for the name account. If not specified,
 *                   it'll be the minimum for rent exemption.
 * @param classAddress - (Optional) The address of the class associated with the registry.
 * @param parentAddress - (Optional) The address of the parent registry.
 * @returns A promise which resolves to the create name registry instruction.
 */
export const createNameRegistry = async (
  rpc: Rpc<GetAccountInfoApi & GetMinimumBalanceForRentExemptionApi>,
  name: string,
  space: number,
  payer: Address,
  owner: Address,
  lamports?: bigint,
  classAddress?: Address,
  parentAddress?: Address
): Promise<IInstruction> => {
  const nameHash = await _generateHash(name);
  const domainAddress = await _getAddressFromHash(
    nameHash,
    parentAddress,
    classAddress
  );

  lamports =
    lamports ||
    (await rpc.getMinimumBalanceForRentExemption(BigInt(space)).send());

  let parentOwner: Address | undefined;
  if (parentAddress) {
    const parentAccount = await RegistryState.retrieve(rpc, parentAddress);
    parentOwner = parentAccount.owner;
  }

  const ix = new createNameRegistryInstruction({
    nameHash,
    lamports,
    space,
  }).getInstruction(
    NAME_PROGRAM_ADDRESS,
    SYSTEM_PROGRAM_ADDRESS,
    domainAddress,
    owner,
    payer,
    classAddress,
    parentAddress,
    parentOwner
  );

  return ix;
};
