import { Buffer } from "buffer";
import { deserialize, Schema } from "borsh";
import { reverseLookup } from "./utils";
import { PublicKey, Connection } from "@solana/web3.js";
import { ErrorType, SNSError } from "./error";

export const NAME_OFFERS_ID = new PublicKey(
  "85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29"
);

export class FavouriteDomain {
  tag: number;
  nameAccount: PublicKey;

  static schema: Schema = new Map([
    [
      FavouriteDomain,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["nameAccount", [32]],
        ],
      },
    ],
  ]);

  constructor(obj: { tag: number; nameAccount: Uint8Array }) {
    this.tag = obj.tag;
    this.nameAccount = new PublicKey(obj.nameAccount);
  }

  /**
   * This function can be used to deserialize a Buffer into a FavouriteDomain object
   * @param data The buffer to deserialize
   * @returns
   */
  static deserialize(data: Buffer) {
    return deserialize(this.schema, FavouriteDomain, data);
  }

  /**
   * This function can be used to retrieve and deserialize a favorite domain
   * @param connection The Solana RPC connection object
   * @param key The favorite account key
   * @returns
   */
  static async retrieve(connection: Connection, key: PublicKey) {
    const accountInfo = await connection.getAccountInfo(key);
    if (!accountInfo || !accountInfo.data) {
      throw new SNSError(ErrorType.FavouriteDomainNotFound);
    }
    return this.deserialize(accountInfo.data);
  }

  /**
   * This function can be used to derive the key of a favorite domain
   * @param programId The name offer program ID
   * @param owner The owner to retrieve the favorite domain for
   * @returns
   */
  static async getKey(programId: PublicKey, owner: PublicKey) {
    return await PublicKey.findProgramAddress(
      [Buffer.from("favourite_domain"), owner.toBuffer()],
      programId
    );
  }

  /**
   * This function can be used to derive the key of a favorite domain
   * @param programId The name offer program ID
   * @param owner The owner to retrieve the favorite domain for
   * @returns
   */
  static getKeySync(programId: PublicKey, owner: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("favourite_domain"), owner.toBuffer()],
      programId
    );
  }
}

/**
 * This function can be used to retrieve the favorite domain of a user
 * @param connection The Solana RPC connection object
 * @param owner The owner you want to retrieve the favorite domain for
 * @returns
 */
export const getFavoriteDomain = async (
  connection: Connection,
  owner: PublicKey
) => {
  const [favKey] = FavouriteDomain.getKeySync(
    NAME_OFFERS_ID,
    new PublicKey(owner)
  );

  const favorite = await FavouriteDomain.retrieve(connection, favKey);

  const reverse = await reverseLookup(connection, favorite.nameAccount);

  return { domain: favorite.nameAccount, reverse };
};
