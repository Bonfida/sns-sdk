import { FavouriteDomain, NAME_OFFERS_ID } from "@bonfida/name-offers";
import { performReverseLookup } from "./utils";
import { PublicKey, Connection } from "@solana/web3.js";

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
  const [favKey] = await FavouriteDomain.getKey(
    NAME_OFFERS_ID,
    new PublicKey(owner)
  );

  const favorite = await FavouriteDomain.retrieve(connection, favKey);

  const reverse = await performReverseLookup(connection, favorite.nameAccount);

  return { domain: favorite.nameAccount, reverse };
};
