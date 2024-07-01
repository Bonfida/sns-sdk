import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export function transferInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  newOwnerKey: PublicKey,
  currentNameOwnerKey: PublicKey,
  nameClassKey?: PublicKey,
  nameParent?: PublicKey,
  parentOwner?: PublicKey,
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([2])), newOwnerKey.toBuffer()];

  const data = Buffer.concat(buffers);

  const keys = [
    {
      pubkey: nameAccountKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: parentOwner ? parentOwner : currentNameOwnerKey,
      isSigner: true,
      isWritable: false,
    },
  ];

  if (nameClassKey) {
    keys.push({
      pubkey: nameClassKey,
      isSigner: true,
      isWritable: false,
    });
  }

  if (parentOwner && nameParent) {
    if (!nameClassKey) {
      keys.push({
        pubkey: PublicKey.default,
        isSigner: false,
        isWritable: false,
      });
    }
    keys.push({
      pubkey: nameParent,
      isSigner: false,
      isWritable: false,
    });
  }

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
