import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class registerFavoriteInstruction {
  tag: number;
  static schema = {
    struct: {
      tag: "u8",
    },
  };

  constructor() {
    this.tag = 6;
  }

  serialize(): Uint8Array {
    return serialize(registerFavoriteInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    nameAccount: Address,
    favouriteAccount: Address,
    owner: Address,
    systemProgram: Address,
    optParent?: Address
  ): IInstruction {
    const data = this.serialize();
    const accounts: IAccountMeta[] = [
      {
        address: nameAccount,
        role: AccountRole.READONLY,
      },
      {
        address: favouriteAccount,
        role: AccountRole.WRITABLE,
      },
      {
        address: owner,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: systemProgram,
        role: AccountRole.READONLY,
      },
    ];

    if (optParent) {
      accounts.push({
        address: optParent,
        role: AccountRole.READONLY,
      });
    }

    return {
      programAddress,
      accounts,
      data,
    };
  }
}
