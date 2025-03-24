import { getCreateAssociatedTokenIdempotentInstructionDataEncoder } from "@solana-program/token";
import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";

export const _createAtaInstruction = (
  programAddress: Address,
  payer: Address,
  ata: Address,
  owner: Address,
  mint: Address,
  systemProgram: Address,
  splTokenProgram: Address
): IInstruction => {
  const accounts: IAccountMeta[] = [
    {
      address: payer,
      role: AccountRole.READONLY,
    },
    {
      address: ata,
      role: AccountRole.READONLY,
    },
    {
      address: owner,
      role: AccountRole.WRITABLE,
    },
    {
      address: mint,
      role: AccountRole.WRITABLE,
    },
    {
      address: systemProgram,
      role: AccountRole.READONLY,
    },
    {
      address: splTokenProgram,
      role: AccountRole.READONLY,
    },
  ];

  return {
    programAddress,
    accounts,
    data: getCreateAssociatedTokenIdempotentInstructionDataEncoder().encode({}),
  };
};
