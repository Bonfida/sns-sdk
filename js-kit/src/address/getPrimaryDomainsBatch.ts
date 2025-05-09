import { findAssociatedTokenPda } from "@solana-program/token";
import {
  Address,
  GetMultipleAccountsApi,
  GetTokenLargestAccountsApi,
  Rpc,
  fetchEncodedAccounts,
} from "@solana/kit";

import { tokenCodec } from "../codecs";
import {
  DEFAULT_ADDRESS,
  NAME_OFFERS_ADDRESS,
  NAME_PROGRAM_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getNftMint } from "../nft/getNftMint";
import { PrimaryDomainState } from "../states/primaryDomain";
import { RegistryState } from "../states/registry";
import { deserializeReverse } from "../utils/deserializers/deserializeReverse";
import { getReverseAddressFromDomainAddress } from "../utils/getReverseAddressFromDomainAddress";

interface GetPrimaryDomainsBatchParams {
  rpc: Rpc<GetMultipleAccountsApi & GetTokenLargestAccountsApi>;
  walletAddresses: Address[];
}

interface ValidPrimary {
  index: number;
  domainAddress: Address;
  registry?: RegistryState;
}

/**
 * Batch retrieves the primary domains associated with a list of wallet addresses.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetMultipleAccountsApi and GetTokenLargestAccountsApi.
 *   - `walletAddresses`: An array of wallet addresses for which primary domains are to be fetched.
 * @returns A promise resolving to an array of strings or undefined values, where each string represents
 *          the primary domain name if available and non-stale.
 */
export const getPrimaryDomainsBatch = async ({
  rpc,
  walletAddresses,
}: GetPrimaryDomainsBatchParams): Promise<(string | undefined)[]> => {
  const result: (string | undefined)[] = new Array(walletAddresses.length).fill(
    undefined
  );
  const addresses = await Promise.all(
    walletAddresses.map((address) =>
      PrimaryDomainState.getAddress(NAME_OFFERS_ADDRESS, address)
    )
  );
  const primaries = await PrimaryDomainState.retrieveBatch(rpc, addresses);

  let validPrimaries = primaries.reduce<ValidPrimary[]>((acc, curr, idx) => {
    if (curr) {
      acc.push({ index: idx, domainAddress: curr.nameAccount });
    }
    return acc;
  }, []);

  const registries = await RegistryState.retrieveBatch(
    rpc,
    validPrimaries.map((item) => item.domainAddress)
  );

  validPrimaries = validPrimaries
    .map((primary, idx) => ({ ...primary, registry: registries[idx] }))
    .filter(({ registry }) => !!registry);

  const revAddressesPromises: Promise<Address>[] = [];
  const parentRevAddressesPromises: (Promise<Address> | Address)[] = [];
  const atasPromises: Promise<Address>[] = [];

  for (const { index, domainAddress, registry } of validPrimaries) {
    const isSub = registry!.parentName !== ROOT_DOMAIN_ADDRESS;

    parentRevAddressesPromises.push(
      isSub
        ? getReverseAddressFromDomainAddress({
            domainAddress: registry!.parentName,
          })
        : DEFAULT_ADDRESS
    );
    revAddressesPromises.push(
      getReverseAddressFromDomainAddress({
        domainAddress,
        parentAddress: isSub ? registry!.parentName : undefined,
      })
    );
    atasPromises.push(
      getNftMint({ domainAddress })
        .then((mint) =>
          findAssociatedTokenPda({
            mint,
            owner: walletAddresses[index],
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
          })
        )
        .then(([pda]) => pda)
    );
  }

  const [revs, parentRevs, tokenAccs] = await Promise.all([
    Promise.all(revAddressesPromises).then((addresses) =>
      fetchEncodedAccounts(rpc, addresses)
    ),
    Promise.all(parentRevAddressesPromises).then((addresses) =>
      fetchEncodedAccounts(rpc, addresses)
    ),
    Promise.all(atasPromises).then((addresses) =>
      fetchEncodedAccounts(rpc, addresses)
    ),
  ]);

  for (const [i, { index, registry }] of validPrimaries.entries()) {
    let parentRev = "";
    const rev = revs[i];
    const parentRevAccount = parentRevs[i];
    const tokenAcc = tokenAccs[i];

    if (!rev.exists) {
      continue;
    }

    if (
      parentRevAccount.exists &&
      parentRevAccount.programAddress === NAME_PROGRAM_ADDRESS
    ) {
      const des = deserializeReverse({ data: parentRevAccount.data.slice(96) });
      parentRev = `.${des}`;
    }

    if (registry!.owner === walletAddresses[index]) {
      result[index] =
        deserializeReverse({
          data: rev.data.slice(96),
          trimFirstNullByte: true,
        }) + parentRev;
      continue;
    }

    // Tokenized
    if (
      tokenAcc.exists &&
      Number(tokenCodec.decode(tokenAcc.data).amount) === 1
    ) {
      result[index] =
        deserializeReverse({ data: rev?.data.slice(96) }) + parentRev;
      continue;
    }

    // Stale otherwise
  }

  return result;
};
