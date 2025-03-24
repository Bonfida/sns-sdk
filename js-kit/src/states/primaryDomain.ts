import {
  Address,
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  Rpc,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  getProgramDerivedAddress,
} from "@solana/kit";
import { deserialize } from "borsh";

import { addressCodec, utf8Codec } from "../codecs";
import {
  InvalidSerializedDataError,
  PrimaryDomainNotFoundError,
} from "../errors";

export class PrimaryDomainState {
  tag: number;
  nameAccount: Address;

  static schema = {
    struct: {
      tag: "u8",
      nameAccount: { array: { type: "u8", len: 32 } },
    },
  };

  constructor(obj: { tag: number; nameAccount: Uint8Array }) {
    this.tag = obj.tag;
    this.nameAccount = addressCodec.decode(obj.nameAccount);
  }

  static deserialize(data: Uint8Array): PrimaryDomainState {
    try {
      return new PrimaryDomainState(deserialize(this.schema, data) as any);
    } catch {
      throw new InvalidSerializedDataError(
        "Failed to deserialize PrimaryDomainState data"
      );
    }
  }

  static async retrieve(rpc: Rpc<GetAccountInfoApi>, address: Address) {
    const primaryDomainAccount = await fetchEncodedAccount(rpc, address);
    if (!primaryDomainAccount.exists) {
      throw new PrimaryDomainNotFoundError(
        "The favourite account does not exist"
      );
    }
    return this.deserialize(primaryDomainAccount.data);
  }

  static async _retrieveBatch(
    rpc: Rpc<GetMultipleAccountsApi>,
    primaryAddresses: Address[]
  ): Promise<(PrimaryDomainState | undefined)[]> {
    const domainAccounts = await fetchEncodedAccounts(rpc, primaryAddresses);

    return domainAccounts.map((account) =>
      account.exists ? this.deserialize(account.data) : undefined
    );
  }

  public static async retrieveBatch(
    rpc: Rpc<GetMultipleAccountsApi>,
    primaryAddresses: Address[]
  ): Promise<(PrimaryDomainState | undefined)[]> {
    const result: (PrimaryDomainState | undefined)[] = [];
    const addresses = [...primaryAddresses];
    while (addresses.length > 0) {
      result.push(
        ...(await this._retrieveBatch(rpc, addresses.splice(0, 100)))
      );
    }

    return result;
  }

  static async getAddress(programAddress: Address, walletAddress: Address) {
    const [address] = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        utf8Codec.encode("favourite_domain"),
        addressCodec.encode(walletAddress),
      ],
    });

    return address;
  }
}
