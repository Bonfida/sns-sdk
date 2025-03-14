import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
import { Buffer } from "buffer";

import type { AccountKey } from "./types";

export class createReverseInstruction {
  tag: number;
  name: string;
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
    },
  };

  constructor(obj: { name: string }) {
    this.tag = 12;
    this.name = obj.name;
  }
  serialize(): Uint8Array {
    return serialize(createReverseInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    reverseLookup: PublicKey,
    systemProgram: PublicKey,
    centralState: PublicKey,
    feePayer: PublicKey,
    rentSysvar: PublicKey,
    parentName?: PublicKey,
    parentNameOwner?: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: namingServiceProgram,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: rootDomain,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: reverseLookup,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: systemProgram,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: centralState,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: feePayer,
      role: AccountRole.WRITABLE_SIGNER,
    });
    keys.push({
      pubkey: rentSysvar,
      role: AccountRole.READONLY,
    });
    if (!!parentName) {
      keys.push({
        pubkey: parentName,
        role: AccountRole.WRITABLE,
      });
    }
    if (!!parentNameOwner) {
      keys.push({
        pubkey: parentNameOwner,
        role: AccountRole.WRITABLE_SIGNER,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
