import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
import { Buffer } from "buffer";

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
    referrerAccountOpt?: PublicKey
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
      pubkey: name,
      role: AccountRole.WRITABLE,
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
      pubkey: buyer,
      role: AccountRole.WRITABLE_SIGNER,
    });
    keys.push({
      pubkey: domainOwner,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: feePayer,
      role: AccountRole.WRITABLE_SIGNER,
    });
    keys.push({
      pubkey: buyerTokenSource,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: pythFeedAccount,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: vault,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: splTokenProgram,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: rentSysvar,
      role: AccountRole.READONLY,
    });
    keys.push({
      pubkey: state,
      role: AccountRole.READONLY,
    });
    if (!!referrerAccountOpt) {
      keys.push({
        pubkey: referrerAccountOpt,
        role: AccountRole.WRITABLE,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
