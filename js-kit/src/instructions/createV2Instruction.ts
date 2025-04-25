import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

import {
  SYSTEM_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "../constants/addresses";

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
    programAddress: Address,
    rentSysvarAccount: Address,
    nameProgramId: Address,
    rootDomain: Address,
    nameAccount: Address,
    reverseLookupAccount: Address,
    centralState: Address,
    buyer: Address,
    buyerTokenAccount: Address,
    usdcVault: Address,
    state: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: rentSysvarAccount,
        role: AccountRole.READONLY,
      },
      {
        address: nameProgramId,
        role: AccountRole.READONLY,
      },
      {
        address: rootDomain,
        role: AccountRole.READONLY,
      },
      {
        address: nameAccount,
        role: AccountRole.WRITABLE,
      },
      {
        address: reverseLookupAccount,
        role: AccountRole.WRITABLE,
      },
      {
        address: SYSTEM_PROGRAM_ADDRESS,
        role: AccountRole.READONLY,
      },
      {
        address: centralState,
        role: AccountRole.READONLY,
      },
      {
        address: buyer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: buyerTokenAccount,
        role: AccountRole.WRITABLE,
      },
      {
        address: usdcVault,
        role: AccountRole.WRITABLE,
      },
      {
        address: TOKEN_PROGRAM_ADDRESS,
        role: AccountRole.READONLY,
      },
      {
        address: state,
        role: AccountRole.READONLY,
      },
    ];

    return {
      programAddress,
      accounts,
      data,
    };
  }
}
