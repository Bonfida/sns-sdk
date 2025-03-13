import {
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
} from "@solana/kit";

import { getNftOwner } from "../nft/getNftOwner";
import { RegistryState } from "../states/registry";
import { getDomainAddress } from "./getDomainAddress";

export const getDomainOwner = async (
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>,
  domain: string
) => {
  const { address: domainAddress } = await getDomainAddress(domain);
  const [registry, nftOwner] = await Promise.all([
    RegistryState.retrieve(rpc, domainAddress),
    getNftOwner(rpc, domainAddress),
  ]);
  return nftOwner || registry.owner;
};
