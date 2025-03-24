import {
  Address,
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
} from "@solana/kit";

import {
  NAME_OFFERS_ADDRESS,
  ROOT_DOMAIN_ACCOUNT,
} from "../constants/addresses";
import { getNftOwner } from "../nft/getNftOwner";
import { PrimaryDomainState } from "../states/primaryDomain";
import { RegistryState } from "../states/registry";
import { reverseLookup } from "../utils/reverseLookup";

export const getPrimaryDomain = async (
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>,
  walletAddress: Address
) => {
  const primaryAddress = await PrimaryDomainState.getAddress(
    NAME_OFFERS_ADDRESS,
    walletAddress
  );
  const primary = await PrimaryDomainState.retrieve(rpc, primaryAddress);
  const [registry, nftOwner] = await Promise.all([
    RegistryState.retrieve(rpc, primary.nameAccount),
    getNftOwner(rpc, primary.nameAccount),
  ]);
  const domainOwner = nftOwner || registry.owner;
  const isSub = registry.parentName !== ROOT_DOMAIN_ACCOUNT;

  const lookups = [
    reverseLookup(
      rpc,
      primary.nameAccount,
      isSub ? registry.parentName : undefined
    ),
  ];

  if (isSub) {
    lookups.push(reverseLookup(rpc, registry.parentName));
  }

  const reverse = (await Promise.all(lookups)).join(".");

  return {
    domain: primary.nameAccount,
    reverse,
    stale: walletAddress !== domainOwner,
  };
};
