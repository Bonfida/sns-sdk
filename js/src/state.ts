import { Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, Schema, serialize } from "borsh";
import { retrieveNftOwner } from "./nft";
import { Buffer } from "buffer";

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

  public static async retrieve(
    connection: Connection,
    nameAccountKey: PublicKey
  ) {
    const nameAccount = await connection.getAccountInfo(nameAccountKey);
    if (!nameAccount) {
      throw new Error("Invalid name account provided");
    }

    let res: NameRegistryState = deserializeUnchecked(
      this.schema,
      NameRegistryState,
      nameAccount.data
    );

    res.data = nameAccount.data?.slice(this.HEADER_LEN);

    const nftOwner = await retrieveNftOwner(connection, nameAccountKey);

    return { registry: res, nftOwner };
  }

  static async _retrieveBatch(
    connection: Connection,
    nameAccountKeys: PublicKey[]
  ) {
    const nameAccounts = await connection.getMultipleAccountsInfo(
      nameAccountKeys
    );
    const fn = (data: Buffer | undefined) => {
      if (!data) return undefined;
      const res: NameRegistryState = deserializeUnchecked(
        this.schema,
        NameRegistryState,
        data
      );
      res.data = data?.slice(this.HEADER_LEN);
      return res;
    };
    return nameAccounts.map((e) => fn(e?.data));
  }

  public static async retrieveBatch(
    connection: Connection,
    nameAccountKeys: PublicKey[]
  ) {
    let result: (NameRegistryState | undefined)[] = [];
    const keys = [...nameAccountKeys];
    while (keys.length > 0) {
      result.push(
        ...(await this._retrieveBatch(connection, keys.splice(0, 100)))
      );
    }
    return result;
  }
}

export class TokenData {
  name: string;
  ticker: string;
  mint: Uint8Array;
  decimals: number;
  website?: string;
  logoUri?: string;

  constructor(obj: {
    name: string;
    ticker: string;
    mint: Uint8Array;
    decimals: number;
    website?: string;
    logoUri?: string;
  }) {
    this.name = obj.name;
    this.ticker = obj.ticker;
    this.mint = obj.mint;
    this.decimals = obj.decimals;
    this.website = obj?.website;
    this.logoUri = obj?.logoUri;
  }

  static schema: Schema = new Map([
    [
      TokenData,
      {
        kind: "struct",
        fields: [
          ["name", "string"],
          ["ticker", "string"],
          ["mint", [32]],
          ["decimals", "u8"],
          ["website", { kind: "option", type: "string" }],
          ["logoUri", { kind: "option", type: "string" }],
        ],
      },
    ],
  ]);

  serialize(): Uint8Array {
    return serialize(TokenData.schema, this);
  }
  static deserialize(data: Buffer) {
    return deserializeUnchecked(TokenData.schema, TokenData, data) as TokenData;
  }
}

export class Mint {
  mint: Uint8Array;
  constructor(obj: { mint: Uint8Array }) {
    this.mint = obj.mint;
  }

  static schema: Schema = new Map([
    [
      Mint,
      {
        kind: "struct",
        fields: [["mint", [32]]],
      },
    ],
  ]);

  serialize(): Uint8Array {
    return serialize(Mint.schema, this);
  }
  static deserialize(data: Buffer) {
    return deserializeUnchecked(Mint.schema, Mint, data) as Mint;
  }
}
