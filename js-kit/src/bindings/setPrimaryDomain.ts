import { Address, GetAccountInfoApi, Rpc } from "@solana/kit";

import {
  NAME_OFFERS_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { registerFavoriteInstruction } from "../instructions/registerFavoriteInstruction";
import { PrimaryDomainState } from "../states/primaryDomain";
import { RegistryState } from "../states/registry";

export const setPrimaryDomain = async (
  rpc: Rpc<GetAccountInfoApi>,
  domainAddress: Address,
  owner: Address
) => {
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
