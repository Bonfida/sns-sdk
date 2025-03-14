import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

import { Numberu32 } from "../int";

export function updateInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  offset: Numberu32,
  input_data: Buffer,
  nameUpdateSigner: PublicKey
): TransactionInstruction {
  const buffers = [
    Buffer.from(Int8Array.from([1])),
    offset.toBuffer(),
    new Numberu32(input_data.length).toBuffer(),
    input_data,
  ];

  const data = Buffer.concat(buffers);
  const keys = [
    {
      pubkey: nameAccountKey,
      role: AccountRole.WRITABLE,
    },
    {
      pubkey: nameUpdateSigner,
      role: AccountRole.READONLY_SIGNER,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}
