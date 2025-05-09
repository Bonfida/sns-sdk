import { Address, GetAccountInfoApi, IInstruction, Rpc } from "@solana/kit";

import {
  NAME_OFFERS_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { registerFavoriteInstruction } from "../instructions/registerFavoriteInstruction";
import { PrimaryDomainState } from "../states/primaryDomain";
import { RegistryState } from "../states/registry";

export interface SetPrimaryDomainParams {
  rpc: Rpc<GetAccountInfoApi>;
  domainAddress: Address;
  owner: Address;
}

/**
 * Sets the primary domain for the specified owner.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi.
 *   - `domainAddress`: The address of the domain to be set as primary.
 *   - `owner`: The address of the domain owner.
 * @returns A promise which resolves to the set primary domain instruction.
 */
export const setPrimaryDomain = async ({
  rpc,
  domainAddress,
  owner,
}: SetPrimaryDomainParams): Promise<IInstruction> => {
  const [registry, primaryAddress] = await Promise.all([
    RegistryState.retrieve(rpc, domainAddress),
    PrimaryDomainState.getAddress(NAME_OFFERS_ADDRESS, owner),
  ]);

  const parent =
    registry.parentName !== ROOT_DOMAIN_ADDRESS
      ? registry.parentName
      : undefined;

  const ix = new registerFavoriteInstruction().getInstruction(
    NAME_OFFERS_ADDRESS,
    domainAddress,
    primaryAddress,
    owner,
    SYSTEM_PROGRAM_ADDRESS,
    parent
  );
  return ix;
};
