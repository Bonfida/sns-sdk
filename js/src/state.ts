import { Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, Schema } from "borsh";
import { retrieveNftOwner } from "./nft";
import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";

export class NameRegistryState {
  static HEADER_LEN = 96;
  parentName: PublicKey;
  owner: PublicKey;
  class: PublicKey;
  data: Buffer | undefined;

  static schema: Schema = new Map([
    [
      NameRegistryState,
      {
        kind: "struct",
        fields: [
          ["parentName", [32]],
          ["owner", [32]],
          ["class", [32]],
        ],
      },
    ],
  ]);
  constructor(obj: {
    parentName: Uint8Array;
    owner: Uint8Array;
    class: Uint8Array;
  }) {
    this.parentName = new PublicKey(obj.parentName);
    this.owner = new PublicKey(obj.owner);
    this.class = new PublicKey(obj.class);
  }

  static deserialize(data: Buffer) {
    let res: NameRegistryState = deserializeUnchecked(
      this.schema,
      NameRegistryState,
      data,
    );

    res.data = data?.slice(this.HEADER_LEN);
    return res;
  }

  public static async retrieve(
    connection: Connection,
    nameAccountKey: PublicKey,
  ) {
    const nameAccount = await connection.getAccountInfo(nameAccountKey);
    if (!nameAccount) {
      throw new SNSError(ErrorType.AccountDoesNotExist);
    }

    let res: NameRegistryState = deserializeUnchecked(
      this.schema,
      NameRegistryState,
      nameAccount.data,
    );

    res.data = nameAccount.data?.slice(this.HEADER_LEN);

    const nftOwner = await retrieveNftOwner(connection, nameAccountKey);

    return { registry: res, nftOwner };
  }

  static async _retrieveBatch(
    connection: Connection,
    nameAccountKeys: PublicKey[],
  ) {
    const nameAccounts =
      await connection.getMultipleAccountsInfo(nameAccountKeys);
    const fn = (data: Buffer | undefined) => {
      if (!data) return undefined;
      const res: NameRegistryState = deserializeUnchecked(
        this.schema,
        NameRegistryState,
        data,
      );
      res.data = data?.slice(this.HEADER_LEN);
      return res;
    };
    return nameAccounts.map((e) => fn(e?.data));
  }

  public static async retrieveBatch(
    connection: Connection,
    nameAccountKeys: PublicKey[],
  ) {
    let result: (NameRegistryState | undefined)[] = [];
    const keys = [...nameAccountKeys];
    while (keys.length > 0) {
      result.push(
        ...(await this._retrieveBatch(connection, keys.splice(0, 100))),
      );
    }
    return result;
  }
}
