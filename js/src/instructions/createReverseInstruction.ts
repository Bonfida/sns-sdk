import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
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
    parentNameOwner?: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: namingServiceProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rootDomain,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: reverseLookup,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: rentSysvar,
      isSigner: false,
      isWritable: false,
    });
    if (!!parentName) {
      keys.push({
        pubkey: parentName,
        isSigner: false,
        isWritable: true,
      });
    }
    if (!!parentNameOwner) {
      keys.push({
        pubkey: parentNameOwner,
        isSigner: true,
        isWritable: true,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
