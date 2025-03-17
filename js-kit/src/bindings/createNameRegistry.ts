import {
  Address,
  GetAccountInfoApi,
  GetMinimumBalanceForRentExemptionApi,
  IInstruction,
  Rpc,
} from "@solana/kit";

import { NAME_PROGRAM_ID, SYSTEM_PROGRAM } from "../constants/addresses";
import { createInstruction } from "../instructions/createInstruction";
import { RegistryState } from "../states/registry";
import { _generateHash, _getAddressFromHash } from "../utils/deriveAddress";
import { Numberu32, Numberu64 } from "../utils/int";

export async function createNameRegistry(
  rpc: Rpc<GetAccountInfoApi & GetMinimumBalanceForRentExemptionApi>,
  domainName: string,
  space: number,
  payerKey: Address,
  nameOwner: Address,
  lamports?: bigint,
  classAddress?: Address,
  parentAddress?: Address
): Promise<IInstruction> {
  const nameHash = await _generateHash(domainName);
  const domainAddress = await _getAddressFromHash(
    nameHash,
    parentAddress,
    classAddress
  );

  const balance = lamports
    ? lamports
    : await rpc.getMinimumBalanceForRentExemption(BigInt(space)).send();
  // : await connection.getMinimumBalanceForRentExemption(space);

  let nameParentOwner: Address | undefined;
  if (parentAddress) {
    const parentAccount = await RegistryState.retrieve(rpc, domainAddress);
    nameParentOwner = parentAccount.owner;
  }

  const createNameInstr = createInstruction(
    NAME_PROGRAM_ID,
    SYSTEM_PROGRAM,
    domainAddress,
    nameOwner,
    payerKey,
    nameHash,
    new Numberu64(balance),
    new Numberu32(space),
    classAddress,
    parentAddress,
    nameParentOwner
  );

  return createNameInstr;
}
