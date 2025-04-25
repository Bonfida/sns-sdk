import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class createReverseInstruction {
  tag: number;
  domain: string;
  static schema = {
    struct: {
      tag: "u8",
      domain: "string",
    },
  };

  constructor(obj: { domain: string }) {
    this.tag = 12;
    this.domain = obj.domain;
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
    payer: Address,
    rentSysvar: Address,
    parentAddress?: Address,
    parentOwner?: Address
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
        address: payer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: rentSysvar,
        role: AccountRole.READONLY,
      },
    ];

    if (parentAddress) {
      accounts.push({
        address: parentAddress,
        role: AccountRole.WRITABLE,
      });
    }

    if (parentOwner) {
      accounts.push({
        address: parentOwner,
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
