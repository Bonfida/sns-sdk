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

interface GetPrimaryDomainParams {
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>;
  walletAddress: Address;
}

/**
 * Fetches the primary domain associated with a given wallet address.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 *   - `walletAddress`: The wallet address for which the primary domain is retrieved.
 * @returns A promise resolving to an object containing:
 *   - `domainAddress`: The address of the primary domain.
 *   - `domainName`: The primary domain name (without .sol suffix).
 *   - `stale`: false if primary domain was set by the current domain owner, true otherwise.
 */
export const getPrimaryDomain = async ({
  rpc,
  walletAddress,
}: GetPrimaryDomainParams): Promise<{
  domainAddress: Address;
  domainName: string;
  stale: boolean;
}> => {
  const primaryAddress = await PrimaryDomainState.getAddress(
    NAME_OFFERS_ADDRESS,
    walletAddress
  );
  const primary = await PrimaryDomainState.retrieve(rpc, primaryAddress);
  const [registry, nftOwner] = await Promise.all([
    RegistryState.retrieve(rpc, primary.nameAccount),
    getNftOwner({ rpc, domainAddress: primary.nameAccount }),
  ]);
  const domainOwner = nftOwner || registry.owner;
  const isSub = registry.parentName !== ROOT_DOMAIN_ADDRESS;

  const lookups = [
    reverseLookup({
      rpc,
      domainAddress: primary.nameAccount,
      parentAddress: isSub ? registry.parentName : undefined,
    }),
  ];

  if (isSub) {
    lookups.push(reverseLookup({ rpc, domainAddress: registry.parentName }));
  }

  const domainName = (await Promise.all(lookups)).join(".");

  return {
    domainAddress: primary.nameAccount,
    domainName,
    stale: walletAddress !== domainOwner,
  };
};
