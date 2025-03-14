import { AccountRole, Address, IInstruction } from "@solana/kit";

import { DEFAULT_ADDRESS } from "../constants/addresses";
import { Numberu32, Numberu64 } from "../utils/int";
import { uint8ArraysConcat } from "../utils/uint8Array/uint8ArraysConcat";

export function createInstruction(
  programAddress: Address,
  systemProgramId: Address,
  nameKey: Address,
  nameOwnerKey: Address,
  payerKey: Address,
  hashed_name: Uint8Array,
  lamports: Numberu64,
  space: Numberu32,
  nameClassKey?: Address,
  nameParent?: Address,
  nameParentOwner?: Address
): IInstruction {
  const data = uint8ArraysConcat([
    Uint8Array.from([0]),
    new Numberu32(hashed_name.length).toUint8Array(),
    hashed_name,
    lamports.toUint8Array(),
    space.toUint8Array(),
  ]);

  const accounts = [
    {
      address: systemProgramId,
      role: AccountRole.READONLY,
    },
    {
      address: payerKey,
      role: AccountRole.WRITABLE_SIGNER,
    },
    {
      address: nameKey,
      role: AccountRole.WRITABLE,
    },
    {
      address: nameOwnerKey,
      role: AccountRole.READONLY,
    },
  ];

  if (nameClassKey) {
    accounts.push({
      address: nameClassKey,
      role: AccountRole.READONLY_SIGNER,
    });
  } else {
    accounts.push({
      address: DEFAULT_ADDRESS,
      role: AccountRole.READONLY,
    });
  }
  if (nameParent) {
    accounts.push({
      address: nameParent,
      role: AccountRole.READONLY,
    });
  } else {
    accounts.push({
      address: DEFAULT_ADDRESS,
      role: AccountRole.READONLY,
    });
  }
  if (nameParentOwner) {
    accounts.push({
      address: nameParentOwner,
      role: AccountRole.READONLY_SIGNER,
    });
  }

  return {
    programAddress,
    accounts,
    data,
  };
}
