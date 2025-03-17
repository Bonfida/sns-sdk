import { AccountRole, Address, IInstruction } from "@solana/kit";

export function deleteInstruction(
  programAddress: Address,
  nameAccountKey: Address,
  refundTargetKey: Address,
  nameOwnerKey: Address
): IInstruction {
  const data = Uint8Array.from([3]);

  const accounts = [
    {
      address: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      address: nameOwnerKey,
      role: AccountRole.READONLY_SIGNER,
    },
    {
      address: refundTargetKey,
      role: AccountRole.WRITABLE,
    },
  ];

  return {
    programAddress,
    accounts,
    data,
  };
}
