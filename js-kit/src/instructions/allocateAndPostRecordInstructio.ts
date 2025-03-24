import {
  AccountRole,
  Address,
  IAccountMeta,
  IInstruction,
  ReadonlyUint8Array,
} from "@solana/kit";
import { serialize } from "borsh";

export class allocateAndPostRecordInstruction {
  tag: number;
  record: string;
  content: ReadonlyUint8Array;

  static schema = {
    struct: {
      tag: "u8",
      record: "string",
      content: { array: { type: "u8" } },
    },
  };

  constructor(obj: { record: string; content: ReadonlyUint8Array }) {
    this.tag = 1;
    this.record = obj.record;
    this.content = obj.content;
  }

  serialize(): Uint8Array {
    return serialize(allocateAndPostRecordInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    systemProgram: Address,
    splNameServiceProgram: Address,
    payer: Address,
    record: Address,
    domainAddress: Address,
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
        address: payer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: record,
        role: AccountRole.WRITABLE,
      },
      {
        address: domainAddress,
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
