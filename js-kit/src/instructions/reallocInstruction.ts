import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

import { Numberu32 } from "../int";

export function reallocInstruction(
  nameProgramId: PublicKey,
  systemProgramId: PublicKey,
  payerKey: PublicKey,
  nameAccountKey: PublicKey,
  nameOwnerKey: PublicKey,
  space: Numberu32
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([4])), space.toBuffer()];

  const data = Buffer.concat(buffers);
  const keys = [
    {
      pubkey: systemProgramId,
      role: AccountRole.READONLY,
    },
    {
      pubkey: payerKey,
      role: AccountRole.WRITABLE_SIGNER,
    },
    {
      pubkey: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      pubkey: nameOwnerKey,
      role: AccountRole.READONLY_SIGNER,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
