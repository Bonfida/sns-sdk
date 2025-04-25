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

interface CreateNameRegistryParams {
  rpc: Rpc<GetAccountInfoApi & GetMinimumBalanceForRentExemptionApi>;
  name: string;
  space: number;
  payer: Address;
  owner: Address;
  lamports?: bigint;
  classAddress?: Address;
  parentAddress?: Address;
}

/**
 * Creates a name registry with the given rent budget, allocated space, owner, and class.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi and GetMinimumBalanceForRentExemptionApi.
 *   - `name`: The name of the new account.
 *   - `space`: The space in bytes allocated to the account.
 *   - `payer`: The allocation cost payer.
 *   - `owner`: The address to be set as the owner of the new name account.
 *   - `lamports`: (Optional) The budget to be set for the name account. If not specified,
 *                 it'll be the minimum for rent exemption.
 *   - `classAddress`: (Optional) The address of the class associated with the registry.
 *   - `parentAddress`: (Optional) The address of the parent registry.
 * @returns A promise which resolves to the create name registry instruction.
 */
export const createNameRegistry = async ({
  rpc,
  name,
  space,
  payer,
  owner,
  lamports,
  classAddress,
  parentAddress,
}: CreateNameRegistryParams): Promise<IInstruction> => {
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
