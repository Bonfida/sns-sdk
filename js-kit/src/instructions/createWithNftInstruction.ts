import { AccountRole, Address, IAccountMeta, IInstruction } from "@solana/kit";
import { serialize } from "borsh";

export class createWithNftInstruction {
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
    this.tag = 17;
    this.name = obj.name;
    this.space = obj.space;
  }

  serialize(): Uint8Array {
    return serialize(createWithNftInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    namingServiceProgram: Address,
    rootDomain: Address,
    name: Address,
    reverseLookup: Address,
    systemProgram: Address,
    centralState: Address,
    buyer: Address,
    nftSource: Address,
    nftMetadata: Address,
    nftMint: Address,
    masterEdition: Address,
    collection: Address,
    splTokenProgram: Address,
    rentSysvar: Address,
    state: Address,
    mplTokenMetadata: Address
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
        address: name,
        role: AccountRole.WRITABLE,
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
        address: buyer,
        role: AccountRole.WRITABLE_SIGNER,
      },
      {
        address: nftSource,
        role: AccountRole.WRITABLE,
      },
      {
        address: nftMetadata,
        role: AccountRole.WRITABLE,
      },
      {
        address: nftMint,
        role: AccountRole.WRITABLE,
      },
      {
        address: masterEdition,
        role: AccountRole.WRITABLE,
      },
      {
        address: collection,
        role: AccountRole.WRITABLE,
      },
      {
        address: splTokenProgram,
        role: AccountRole.READONLY,
      },
      {
        address: rentSysvar,
        role: AccountRole.READONLY,
      },
      {
        address: state,
        role: AccountRole.READONLY,
      },
      {
        address: mplTokenMetadata,
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
