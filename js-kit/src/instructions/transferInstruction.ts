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
       role: AccountRole.WRITABLE,
    },
    {
      pubkey: parentOwner ? parentOwner : currentNameOwnerKey,
       role: AccountRole.READONLY_SIGNER,
    },
  ];

  if (nameClassKey) {
    keys.push({
      pubkey: nameClassKey,
       role: AccountRole.READONLY_SIGNER,
    });
  }

  if (parentOwner && nameParent) {
    if (!nameClassKey) {
      keys.push({
        pubkey: PublicKey.default,
        role: AccountRole.READONLY,,
      });
    }
    keys.push({
      pubkey: nameParent,
       role: AccountRole.READONLY,
    });
  }

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
