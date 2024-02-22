import { Buffer } from "buffer";
import { deserialize, Schema } from "borsh";
import {
  deserializeReverse,
  getReverseKeyFromDomainKey,
  reverseLookup,
} from "./utils";
import { PublicKey, Connection } from "@solana/web3.js";
import { ErrorType, SNSError } from "./error";
import { resolve } from "./resolve";
import { getDomainMint } from "./nft/name-tokenizer";
import {
  AccountLayout,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { NameRegistryState } from "./state";

export const NAME_OFFERS_ID = new PublicKey(
  "85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29",
);

export class FavouriteDomain {
  tag: number;
  nameAccount: PublicKey;
  static schema = {
    struct: {
      tag: "u8",
      nameAccount: { array: { type: "u8", len: 32 } },
    },
  };

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
    return new FavouriteDomain(deserialize(this.schema, data) as any);
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
      programId,
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
      programId,
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
  owner: PublicKey,
) => {
  const [favKey] = FavouriteDomain.getKeySync(
    NAME_OFFERS_ID,
    new PublicKey(owner),
  );

  const favorite = await FavouriteDomain.retrieve(connection, favKey);

  const reverse = await reverseLookup(connection, favorite.nameAccount);
  const { registry, nftOwner } = await NameRegistryState.retrieve(
    connection,
    favorite.nameAccount,
  );
  const domainOwner = nftOwner || registry.owner;

  return {
    domain: favorite.nameAccount,
    reverse,
    stale: !owner.equals(domainOwner),
  };
};

/**
 * This function can be used to retrieve the favorite domains for multiple wallets, up to a maximum of 100.
 * If a wallet does not have a favorite domain, the result will be 'undefined' instead of the human readable domain as a string.
 * This function is optimized for network efficiency, making only four RPC calls, three of which are executed in parallel using Promise.all, thereby reducing the overall execution time.
 * @param connection The Solana RPC connection object
 * @param wallets An array of PublicKeys representing the wallets
 * @returns A promise that resolves to an array of strings or undefined, representing the favorite domains or lack thereof for each wallet
 */
export const getMultipleFavoriteDomains = async (
  connection: Connection,
  wallets: PublicKey[],
): Promise<(string | undefined)[]> => {
  const result: (string | undefined)[] = [];

  const favKeys = wallets.map(
    (e) => FavouriteDomain.getKeySync(NAME_OFFERS_ID, e)[0],
  );
  const favDomains = (await connection.getMultipleAccountsInfo(favKeys)).map(
    (e) => {
      if (!!e?.data) {
        return FavouriteDomain.deserialize(e?.data).nameAccount;
      }
      return PublicKey.default;
    },
  );
  const revKeys = favDomains.map((e) => getReverseKeyFromDomainKey(e));
  const atas = favDomains.map((e, idx) => {
    const mint = getDomainMint(e);
    const ata = getAssociatedTokenAddressSync(mint, wallets[idx], true);
    return ata;
  });

  const [domainInfos, revs, tokenAccs] = await Promise.all([
    connection.getMultipleAccountsInfo(favDomains),
    connection.getMultipleAccountsInfo(revKeys),
    connection.getMultipleAccountsInfo(atas),
  ]);

  for (let i = 0; i < wallets.length; i++) {
    const domainInfo = domainInfos[i];
    const rev = revs[i];
    const tokenAcc = tokenAccs[i];

    if (!domainInfo || !rev) {
      result.push(undefined);
      continue;
    }

    const nativeOwner = new PublicKey(domainInfo?.data.slice(32, 64));

    if (nativeOwner.equals(wallets[i])) {
      result.push(deserializeReverse(rev?.data.slice(96)));
      continue;
    }
    // Either tokenized or stale
    if (!tokenAcc) {
      result.push(undefined);
      continue;
    }

    const decoded = AccountLayout.decode(tokenAcc.data);
    // Tokenized
    if (Number(decoded.amount) === 1) {
      result.push(deserializeReverse(rev?.data.slice(96)));
      continue;
    }

    // Stale
    result.push(undefined);
  }

  return result;
};
