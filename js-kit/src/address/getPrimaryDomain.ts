import {
  Address,
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
} from "@solana/kit";

import {
  NAME_OFFERS_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
} from "../constants/addresses";
import { getNftOwner } from "../nft/getNftOwner";
import { PrimaryDomainState } from "../states/primaryDomain";
import { RegistryState } from "../states/registry";
import { reverseLookup } from "../utils/reverseLookup";

/**
 * Fetches the primary domain associated with a given wallet address.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 * @param walletAddress - The wallet address for which the primary domain is retrieved.
 * @returns A promise resolving to an object containing:
 *   - domainAddress: The address of the primary domain.
 *   - domainName: The primary domain name (without .sol suffix).
 *   - stale: false if primary domain was set by the current domain owner, true otherwise.
 */
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
  const isSub = registry.parentName !== ROOT_DOMAIN_ADDRESS;

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

  const domainName = (await Promise.all(lookups)).join(".");

  return {
    domainAddress: primary.nameAccount,
    domainName,
    stale: walletAddress !== domainOwner,
  };
};
