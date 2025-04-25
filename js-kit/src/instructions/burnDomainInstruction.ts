import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class burnDomainInstruction {
  tag: number;

  static schema = {
    struct: {
      tag: "u8",
    },
  };

  constructor() {
    this.tag = 16;
  }

  serialize(): Uint8Array {
    return serialize(burnDomainInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    nameServiceId: Address,
    systemProgram: Address,
    domainAddress: Address,
    reverse: Address,
    resellingState: Address,
    state: Address,
    centralState: Address,
    owner: Address,
    target: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: nameServiceId,
        role: AccountRole.READONLY,
      },
      {
        address: systemProgram,
        role: AccountRole.READONLY,
      },
      {
        address: domainAddress,
        role: AccountRole.WRITABLE,
      },
      {
        address: reverse,
        role: AccountRole.WRITABLE,
      },
      {
        address: resellingState,
        role: AccountRole.WRITABLE,
      },
      {
        address: state,
        role: AccountRole.WRITABLE,
      },
      {
        address: centralState,
        role: AccountRole.READONLY,
      },
      {
        address: owner,
        role: AccountRole.READONLY_SIGNER,
      },
      {
        address: target,
        role: AccountRole.WRITABLE,
      },
    ];

    return {
      programAddress,
      accounts,
      data,
    };
  }
}
