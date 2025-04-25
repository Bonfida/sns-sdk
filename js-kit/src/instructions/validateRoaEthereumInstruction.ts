import {
  AccountRole,
  Address,
  IAccountMeta,
  IInstruction,
  ReadonlyUint8Array,
} from "@solana/kit";
import { serialize } from "borsh";

export class validateRoaEthereumInstruction {
  tag: number;
  validation: number;
  signature: ReadonlyUint8Array;
  expectedPubkey: ReadonlyUint8Array;

  static schema = {
    struct: {
      tag: "u8",
      validation: "u8",
      signature: { array: { type: "u8" } },
      expectedPubkey: { array: { type: "u8" } },
    },
  };

  constructor(obj: {
    validation: number;
    signature: ReadonlyUint8Array;
    expectedPubkey: ReadonlyUint8Array;
  }) {
    this.tag = 4;
    this.validation = obj.validation;
    this.signature = obj.signature;
    this.expectedPubkey = obj.expectedPubkey;
  }

  serialize(): Uint8Array {
    return serialize(validateRoaEthereumInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    systemProgram: Address,
    splNameServiceProgram: Address,
    feePayer: Address,
    record: Address,
    domain: Address,
    domainOwner: Address,
    centralState: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: systemProgram,
        role: AccountRole.READONLY,
      },
      {
        address: splNameServiceProgram,
        role: AccountRole.READONLY,
      },
      {
        address: feePayer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: record,
        role: AccountRole.WRITABLE,
      },
      {
        address: domain,
        role: AccountRole.WRITABLE,
      },
      {
        address: domainOwner,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: centralState,
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
