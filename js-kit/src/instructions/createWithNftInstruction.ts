import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { serialize } from "borsh";
import { Buffer } from "buffer";

import type { AccountKey } from "./types";

export class createWithNftInstruction {
  tag: number;
  name: string;
  space: number;
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
      space: "u32",
    },
  };

  constructor(obj: { name: string; space: number }) {
    this.tag = 17;
    this.name = obj.name;
    this.space = obj.space;
  }
  serialize(): Uint8Array {
    return serialize(createWithNftInstruction.schema, this);
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
    nftSource: PublicKey,
    nftMetadata: PublicKey,
    nftMint: PublicKey,
    masterEdition: PublicKey,
    collection: PublicKey,
    splTokenProgram: PublicKey,
    rentSysvar: PublicKey,
    state: PublicKey,
    mplTokenMetadata: PublicKey
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
      pubkey: nftSource,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: nftMetadata,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: nftMint,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: masterEdition,
      role: AccountRole.WRITABLE,
    });
    keys.push({
      pubkey: collection,
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
    keys.push({
      pubkey: mplTokenMetadata,
      role: AccountRole.READONLY,
    });
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
