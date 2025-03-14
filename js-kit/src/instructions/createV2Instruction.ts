import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { serialize } from "borsh";
import { Buffer } from "buffer";

export class createV2Instruction {
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
    this.tag = 9;
    this.name = obj.name;
    this.space = obj.space;
  }

  serialize(): Uint8Array {
    return serialize(createV2Instruction.schema, this);
  }

  getInstruction(
    programId: PublicKey,
    rentSysvarAccount: PublicKey,
    nameProgramId: PublicKey,
    rootDomain: PublicKey,
    nameAccount: PublicKey,
    reverseLookupAccount: PublicKey,
    centralState: PublicKey,
    buyer: PublicKey,
    buyerTokenAccount: PublicKey,
    usdcVault: PublicKey,
    state: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    const keys = [
      {
        pubkey: rentSysvarAccount,
        role: AccountRole.READONLY,,
      },
      {
        pubkey: nameProgramId,
        role: AccountRole.READONLY,,
      },
      {
        pubkey: rootDomain,
        role: AccountRole.READONLY,,
      },
      {
        pubkey: nameAccount,
        role: AccountRole.WRITABLE,
      },
      {
        pubkey: reverseLookupAccount,
        role: AccountRole.WRITABLE,
      },
      {
        pubkey: SystemProgram.programId,
        role: AccountRole.READONLY,,
      },
      {
        pubkey: centralState,
        role: AccountRole.READONLY,,
      },
      {
        pubkey: buyer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        pubkey: buyerTokenAccount,
        role: AccountRole.WRITABLE,
      },
      {
        pubkey: usdcVault,
        role: AccountRole.WRITABLE,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        role: AccountRole.READONLY,,
      },
      {
        pubkey: state,
        role: AccountRole.READONLY,,
      },
    ];

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
