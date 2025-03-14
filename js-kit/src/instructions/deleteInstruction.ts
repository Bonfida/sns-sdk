import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

export function deleteInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  refundTargetKey: PublicKey,
  nameOwnerKey: PublicKey
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([3]))];

  const data = Buffer.concat(buffers);
  const keys = [
    {
      pubkey: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      pubkey: nameOwnerKey,
      role: AccountRole.READONLY_SIGNER,
    },
    {
      pubkey: refundTargetKey,
      role: AccountRole.WRITABLE,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
