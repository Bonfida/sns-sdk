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
       role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: favouriteAccount,
       role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: owner,
       role: AccountRole.WRITABLE_SIGNER,
    });
    keys.push({
      pubkey: systemProgram,
       role: AccountRole.READONLY,
    });
    if (!!optParent) {
      keys.push({
        pubkey: optParent,
        role: AccountRole.READONLY,,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
