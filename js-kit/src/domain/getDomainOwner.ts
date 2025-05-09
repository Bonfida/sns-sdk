import {
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
} from "@solana/kit";

import { getNftOwner } from "../nft/getNftOwner";
import { RegistryState } from "../states/registry";
import { getDomainAddress } from "./getDomainAddress";

interface GetDomainOwnerParams {
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>;
  domain: string;
}

/**
 * Retrieves the owner of the specified domain. If the domain is tokenized,
 * the NFT's owner is returned; otherwise, the registry owner is returned.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 *   - `domain`: The domain whose owner is to be retrieved.
 * @returns A promise that resolves to the owner of the domain.
 */
export const getDomainOwner = async ({ rpc, domain }: GetDomainOwnerParams) => {
  const { domainAddress } = await getDomainAddress({ domain });
  const [registry, nftOwner] = await Promise.all([
    RegistryState.retrieve(rpc, domainAddress),
    getNftOwner({ rpc, domainAddress }),
  ]);
  return nftOwner || registry.owner;
};
