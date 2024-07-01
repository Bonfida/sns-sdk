import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
import type { AccountKey } from "./types";

export class burnInstruction {
  tag: number;
  static schema = {
    struct: {
      tag: "u8",
    },
  };

  constructor() {
    this.tag = 16;
  }
  serialize(): Uint8Array {
    return serialize(burnInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    nameServiceId: PublicKey,
    systemProgram: PublicKey,
    domain: PublicKey,
    reverse: PublicKey,
    resellingState: PublicKey,
    state: PublicKey,
    centralState: PublicKey,
    owner: PublicKey,
    target: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: nameServiceId,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: domain,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: reverse,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: resellingState,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: state,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: owner,
      isSigner: true,
      isWritable: false,
    });
    keys.push({
      pubkey: target,
      isSigner: false,
      isWritable: true,
    });
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
