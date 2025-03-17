import { AccountRole, Address, IInstruction } from "@solana/kit";

import { addressCodec } from "../codecs";
import { DEFAULT_ADDRESS } from "../constants/addresses";
import { uint8ArraysConcat } from "../utils/uint8Array/uint8ArraysConcat";

export function transferInstruction(
  programAddress: Address,
  nameAccountKey: Address,
  newOwnerKey: Address,
  currentNameOwnerKey: Address,
  nameClassKey?: Address,
  nameParent?: Address,
  parentOwner?: Address
): IInstruction {
  const data = uint8ArraysConcat([
    Uint8Array.from([2]),
    addressCodec.encode(newOwnerKey),
  ]);

  const accounts = [
    {
      address: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      address: parentOwner ? parentOwner : currentNameOwnerKey,
      role: AccountRole.READONLY_SIGNER,
    },
  ];

  if (nameClassKey) {
    accounts.push({
      address: nameClassKey,
      role: AccountRole.READONLY_SIGNER,
    });
  }

  if (parentOwner && nameParent) {
    if (!nameClassKey) {
      accounts.push({
        address: DEFAULT_ADDRESS,
        role: AccountRole.READONLY,
      });
    }

    accounts.push({
      address: nameParent,
      role: AccountRole.READONLY,
    });
  }

  return {
    programAddress,
    accounts,
    data,
  };
}
