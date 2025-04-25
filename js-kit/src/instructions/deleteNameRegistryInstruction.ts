import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class DeleteNameRegistryInstruction {
  tag: number;

  static schema = {
    struct: {
      tag: "u8",
    },
  };

  constructor() {
    this.tag = 3;
  }

  serialize(): Uint8Array {
    return serialize(DeleteNameRegistryInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    domainAddress: Address,
    refundTarget: Address,
    owner: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: domainAddress,
        role: AccountRole.WRITABLE,
      },
      {
        address: owner,
        role: AccountRole.READONLY_SIGNER,
      },
      {
        address: refundTarget,
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
