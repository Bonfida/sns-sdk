import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

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
    programAddress: Address,
    namingServiceProgram: Address,
    rootDomain: Address,
    reverseLookup: Address,
    systemProgram: Address,
    centralState: Address,
    feePayer: Address,
    rentSysvar: Address,
    parentName?: Address,
    parentNameOwner?: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: namingServiceProgram,
        role: AccountRole.READONLY,
      },
      {
        address: rootDomain,
        role: AccountRole.READONLY,
      },
      {
        address: reverseLookup,
        role: AccountRole.WRITABLE,
      },
      {
        address: systemProgram,
        role: AccountRole.READONLY,
      },
      {
        address: centralState,
        role: AccountRole.READONLY,
      },
      {
        address: feePayer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: rentSysvar,
        role: AccountRole.READONLY,
      },
    ];

    if (parentName) {
      accounts.push({
        address: parentName,
        role: AccountRole.WRITABLE,
      });
    }

    if (parentNameOwner) {
      accounts.push({
        address: parentNameOwner,
        role: AccountRole.WRITABLE_SIGNER,
      });
    }

    return {
      programAddress,
      accounts,
      data,
    };
  }
}
