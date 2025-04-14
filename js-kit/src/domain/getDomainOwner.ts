import {
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
} from "@solana/kit";

import { getNftOwner } from "../nft/getNftOwner";
import { RegistryState } from "../states/registry";
import { getDomainAddress } from "./getDomainAddress";

/**
 * Retrieves the owner of the specified domain. If the domain is tokenized,
 * the NFT's owner is returned; otherwise, the registry owner is returned.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 * @param domain - The domain whose owner is to be retrieved.
 * @returns A promise that resolves to the owner of the domain.
 */

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
