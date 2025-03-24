import {
  AccountRole,
  Address,
  IAccountMeta,
  IInstruction,
  ReadonlyUint8Array,
} from "@solana/kit";
import { serialize } from "borsh";

import { addressCodec } from "../codecs";
import { DEFAULT_ADDRESS } from "../constants/addresses";

export class TransferInstruction {
  tag: number;
  encodedNewOwnerAddress: ReadonlyUint8Array;

  static schema = {
    struct: {
      tag: "u8",
      encodedNewOwnerAddress: { array: { type: "u8" } },
    },
  };

  constructor(obj: { newOwner: Address }) {
    this.tag = 2;
    this.encodedNewOwnerAddress = addressCodec.encode(obj.newOwner);
  }

  serialize(): Uint8Array {
    return serialize(TransferInstruction.schema, this);
  }

  getInstruction(
    programAddress: Address,
    domainAddress: Address,
    currentOwner: Address,
    classAddress?: Address,
    parentAddress?: Address,
    parentOwner?: Address
  ): IInstruction {
    const data = this.serialize();

    const accounts: IAccountMeta[] = [
      {
        address: domainAddress,
        role: AccountRole.WRITABLE,
      },
      {
        address: parentOwner ? parentOwner : currentOwner,
        role: AccountRole.READONLY_SIGNER,
      },
    ];

    if (classAddress) {
      accounts.push({
        address: classAddress,
        role: AccountRole.READONLY_SIGNER,
      });
    }

    if (parentOwner && parentAddress) {
      if (!classAddress) {
        accounts.push({
          address: DEFAULT_ADDRESS,
          role: AccountRole.READONLY,
        });
      }

      accounts.push({
        address: parentAddress,
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
