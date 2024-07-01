import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export function deleteInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  refundTargetKey: PublicKey,
  nameOwnerKey: PublicKey,
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([3]))];

  const data = Buffer.concat(buffers);
  const keys = [
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
    {
      pubkey: refundTargetKey,
      isSigner: false,
      isWritable: true,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
