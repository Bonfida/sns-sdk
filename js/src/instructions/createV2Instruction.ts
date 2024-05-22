import { Buffer } from "buffer";
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { serialize } from "borsh";

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
    state: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    const keys = [
      {
        pubkey: rentSysvarAccount,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: nameProgramId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: rootDomain,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: nameAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: reverseLookupAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: centralState,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: buyer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: buyerTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: usdcVault,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: state,
        isSigner: false,
        isWritable: false,
      },
    ];

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
