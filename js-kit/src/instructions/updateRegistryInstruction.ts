import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class UpdateRegistryInstruction {
  tag: number;
  offset: number;
  inputData: Uint8Array;

  static schema = {
    struct: {
      tag: "u8",
      offset: "u32",
      inputData: { array: { type: "u8" } },
    },
  };

  constructor(obj: { offset: number; inputDat: Uint8Array }) {
    this.tag = 1;
    this.offset = obj.offset;
    this.inputData = obj.inputDat;
  }

  serialize(): Uint8Array {
    return serialize(UpdateRegistryInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    domainAddress: Address,
    signer: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: domainAddress,
        role: AccountRole.WRITABLE,
      },
      {
        address: signer,
        role: AccountRole.READONLY_SIGNER,
      },
    ];

    return {
      programAddress,
      accounts,
      data,
    };
  }
}
