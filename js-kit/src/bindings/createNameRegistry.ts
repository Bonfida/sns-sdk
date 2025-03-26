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

export async function createNameRegistry(
  rpc: Rpc<GetAccountInfoApi & GetMinimumBalanceForRentExemptionApi>,
  name: string,
  space: number,
  payer: Address,
  owner: Address,
  lamports?: bigint,
  classAddress?: Address,
  parentAddress?: Address
): Promise<IInstruction> {
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
}
