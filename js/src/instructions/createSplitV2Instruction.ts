import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
import type { AccountKey } from "./types";

export class createSplitV2Instruction {
  tag: number;
  name: string;
  space: number;
  referrerIdxOpt: number | null;
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
      space: "u32",
      referrerIdxOpt: { option: "u16" },
    },
  };
  constructor(obj: {
    name: string;
    space: number;
    referrerIdxOpt: number | null;
  }) {
    this.tag = 20;
    this.name = obj.name;
    this.space = obj.space;
    this.referrerIdxOpt = obj.referrerIdxOpt;
  }
  serialize(): Uint8Array {
    return serialize(createSplitV2Instruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    name: PublicKey,
    reverseLookup: PublicKey,
    systemProgram: PublicKey,
    centralState: PublicKey,
    buyer: PublicKey,
    domainOwner: PublicKey,
    feePayer: PublicKey,
    buyerTokenSource: PublicKey,
    pythFeedAccount: PublicKey,
    vault: PublicKey,
    splTokenProgram: PublicKey,
    rentSysvar: PublicKey,
    state: PublicKey,
    referrerAccountOpt?: PublicKey,
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
      pubkey: name,
      isSigner: false,
      isWritable: true,
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
      pubkey: buyer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: domainOwner,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: buyerTokenSource,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: pythFeedAccount,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: vault,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: splTokenProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rentSysvar,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: state,
      isSigner: false,
      isWritable: false,
    });
    if (!!referrerAccountOpt) {
      keys.push({
        pubkey: referrerAccountOpt,
        isSigner: false,
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
