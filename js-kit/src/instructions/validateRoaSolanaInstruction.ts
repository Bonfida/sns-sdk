import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class validateRoaSolanaInstruction {
  tag: number;
  staleness: boolean;
  static schema = {
    struct: {
      tag: "u8",
      staleness: "bool",
    },
  };

  constructor(obj: { staleness: boolean }) {
    this.tag = 3;
    this.staleness = obj.staleness;
  }

  serialize(): Uint8Array {
    return serialize(validateRoaSolanaInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    systemProgram: Address,
    splNameServiceProgram: Address,
    feePayer: Address,
    record: Address,
    domain: Address,
    domainOwner: Address,
    centralState: Address,
    verifier: Address
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
        role: AccountRole.WRITABLE,
      },
      {
        address: centralState,
        role: AccountRole.READONLY,
      },
      {
        address: verifier,
        role: AccountRole.WRITABLE_SIGNER,
      },
    ];

    return {
      programAddress,
      accounts,
      data,
    };
  }
}
