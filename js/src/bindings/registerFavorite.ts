import { PublicKey, SystemProgram } from "@solana/web3.js";
import { registerFavoriteInstruction } from "../instructions/registerFavoriteInstruction";
import { FavouriteDomain, NAME_OFFERS_ID } from "../favorite-domain";

/**
 * This function can be used to register a domain name as favorite
 * @param nameAccount The name account being registered as favorite
 * @param owner The owner of the name account
 * @param programId The name offer program ID
 * @returns
 */
export const registerFavorite = (nameAccount: PublicKey, owner: PublicKey) => {
  const [favKey] = FavouriteDomain.getKeySync(NAME_OFFERS_ID, owner);
  const ix = new registerFavoriteInstruction().getInstruction(
    NAME_OFFERS_ID,
    nameAccount,
    favKey,
    owner,
    SystemProgram.programId,
  );
  return ix;
};
