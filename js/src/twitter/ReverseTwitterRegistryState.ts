import { deserialize } from "borsh";
import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "../state";
import { InvalidReverseTwitterError } from "../error";

export class ReverseTwitterRegistryState {
  twitterRegistryKey: Uint8Array;
  twitterHandle: string;

  static schema = {
    struct: {
      twitterRegistryKey: { array: { type: "u8", len: 32 } },
      twitterHandle: "string",
    },
  };

  constructor(obj: { twitterRegistryKey: Uint8Array; twitterHandle: string }) {
    this.twitterRegistryKey = obj.twitterRegistryKey;
    this.twitterHandle = obj.twitterHandle;
  }

  public static async retrieve(
    connection: Connection,
    reverseTwitterAccountKey: PublicKey,
  ): Promise<ReverseTwitterRegistryState> {
    let reverseTwitterAccount = await connection.getAccountInfo(
      reverseTwitterAccountKey,
      "processed",
    );
    if (!reverseTwitterAccount) {
      throw new InvalidReverseTwitterError(
        "The reverse twitter account was not found",
      );
    }

    const res = new ReverseTwitterRegistryState(
      deserialize(
        ReverseTwitterRegistryState.schema,
        reverseTwitterAccount.data.slice(NameRegistryState.HEADER_LEN),
      ) as any,
    );

    return res;
  }
}
