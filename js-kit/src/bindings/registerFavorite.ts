import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";

import { ROOT_DOMAIN_ACCOUNT } from "../constants";
import { FavouriteDomain, NAME_OFFERS_ID } from "../favorite-domain";
import { registerFavoriteInstruction } from "../instructions/registerFavoriteInstruction";
import { NameRegistryState } from "../state";

/**
 * This function can be used to register a domain name as favorite
 * @param nameAccount The name account being registered as favorite
 * @param owner The owner of the name account
 * @param programId The name offer program ID
 * @returns
 */
export const registerFavorite = async (
  connection: Connection,
  nameAccount: Address,
  owner: Address
) => {
  let parent: PublicKey | undefined = undefined;
  const { registry } = await NameRegistryState.retrieve(
    connection,
    nameAccount
  );
  if (!registry.parentName.equals(ROOT_DOMAIN_ACCOUNT)) {
    parent = registry.parentName;
  }

  const [favKey] = await FavouriteDomain.getKey(NAME_OFFERS_ID, owner);
  const ix = new registerFavoriteInstruction().getInstruction(
    NAME_OFFERS_ID,
    nameAccount,
    favKey,
    owner,
    SystemProgram.programId,
    parent
  );
  return ix;
};

export { registerFavorite as setPrimaryDomain };
