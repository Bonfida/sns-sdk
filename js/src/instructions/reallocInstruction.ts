import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Numberu32 } from "../int";

export function reallocInstruction(
  nameProgramId: PublicKey,
  systemProgramId: PublicKey,
  payerKey: PublicKey,
  nameAccountKey: PublicKey,
  nameOwnerKey: PublicKey,
  space: Numberu32,
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([4])), space.toBuffer()];

  const data = Buffer.concat(buffers);
  const keys = [
    {
      pubkey: systemProgramId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: payerKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: nameAccountKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: nameOwnerKey,
      isSigner: true,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
