import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
import type { AccountKey } from "./types";

export class registerFavoriteInstruction {
  tag: number;
  static schema = {
    struct: {
      tag: "u8",
    },
  };
  constructor() {
    this.tag = 6;
  }
  serialize(): Uint8Array {
    return serialize(registerFavoriteInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    nameAccount: PublicKey,
    favouriteAccount: PublicKey,
    owner: PublicKey,
    systemProgram: PublicKey,
    optParent?: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: nameAccount,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: favouriteAccount,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: owner,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    if (!!optParent) {
      keys.push({
        pubkey: optParent,
        isSigner: false,
        isWritable: false,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
