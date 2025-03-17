import { AccountRole, Address, IInstruction } from "@solana/kit";

import { Numberu32 } from "../utils/int";
import { uint8ArraysConcat } from "../utils/uint8Array/uint8ArraysConcat";

export function reallocInstruction(
  programAddress: Address,
  systemProgramId: Address,
  payerKey: Address,
  nameAccountKey: Address,
  nameOwnerKey: Address,
  space: Numberu32
): IInstruction {
  const data = uint8ArraysConcat([Uint8Array.from([4]), space.toUint8Array()]);

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
      address: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      address: nameOwnerKey,
      role: AccountRole.READONLY_SIGNER,
    },
  ];

  return {
    programAddress,
    accounts,
    data,
  };
}
