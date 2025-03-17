import { AccountRole, Address, IInstruction } from "@solana/kit";

import { Numberu32 } from "../utils/int";
import { uint8ArraysConcat } from "../utils/uint8Array/uint8ArraysConcat";

export function updateInstruction(
  programAddress: Address,
  nameAccountKey: Address,
  offset: Numberu32,
  input_data: Uint8Array,
  nameUpdateSigner: Address
): IInstruction {
  const data = uint8ArraysConcat([
    Uint8Array.from([1]),
    offset.toUint8Array(),
    new Numberu32(input_data.length).toUint8Array(),
    input_data,
  ]);

  const accounts = [
    {
      address: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      address: nameUpdateSigner,
      role: AccountRole.READONLY_SIGNER,
    },
  ];

  return {
    programAddress,
    accounts,
    data,
  };
}
