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
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  TOKEN_PROGRAM_ID,
} from "../constants/addresses";
import { getNftMint } from "../nft/getNftMint";
import { PrimaryDomainState } from "../states/primaryDomain";
import { RegistryState } from "../states/registry";
import { deserializeReverse } from "../utils/deserializers/deserializeReverse";
import { getReverseAddressFromDomainAddress } from "../utils/getReverseAddressFromDomainAddress";

interface ValidPrimary {
  index: number;
  address: Address;
  registry?: RegistryState;
}

export const getPrimaryDomainsBatch = async (
  rpc: Rpc<GetMultipleAccountsApi & GetTokenLargestAccountsApi>,
  walletAddresses: Address[]
): Promise<(string | undefined)[]> => {
  const result: (string | undefined)[] = new Array(walletAddresses.length).fill(
    undefined
  );
  const addresses = await Promise.all(
    walletAddresses.map((address) => PrimaryDomainState.getAddress(address))
  );
  const primaries = await PrimaryDomainState.retrieveBatch(rpc, addresses);

  let validPrimaries = primaries.reduce<ValidPrimary[]>((acc, curr, idx) => {
    if (curr) {
      acc.push({ index: idx, address: curr.nameAccount });
    }
    return acc;
  }, []);

  const registries = await RegistryState.retrieveBatch(
    rpc,
    validPrimaries.map((item) => item.address)
  );

  validPrimaries = validPrimaries
    .map((primary, idx) => ({ ...primary, registry: registries[idx] }))
    .filter(({ registry }) => !!registry);

  const revAddressesPromises: Promise<Address>[] = [];
  const parentRevAddressesPromises: (Promise<Address> | Address)[] = [];
  const atasPromises: Promise<Address>[] = [];

  for (const { index, address, registry } of validPrimaries) {
    const isSub = registry!.parentName !== ROOT_DOMAIN_ACCOUNT;

    parentRevAddressesPromises.push(
      isSub
        ? getReverseAddressFromDomainAddress(registry!.parentName)
        : DEFAULT_ADDRESS
    );
    revAddressesPromises.push(
      getReverseAddressFromDomainAddress(
        address,
        isSub ? registry!.parentName : undefined
      )
    );
    atasPromises.push(
      getNftMint(address)
        .then((mint) =>
          findAssociatedTokenPda({
            mint,
            owner: walletAddresses[index],
            tokenProgram: TOKEN_PROGRAM_ID,
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
      parentRevAccount.programAddress === NAME_PROGRAM_ID
    ) {
      const des = deserializeReverse(parentRevAccount.data.slice(96));
      parentRev = `.${des}`;
    }

    if (registry!.owner === walletAddresses[index]) {
      result[index] = deserializeReverse(rev.data.slice(96), true) + parentRev;
      continue;
    }

    // Tokenized
    if (
      tokenAcc.exists &&
      Number(tokenCodec.decode(tokenAcc.data).amount) === 1
    ) {
      result[index] = deserializeReverse(rev?.data.slice(96)) + parentRev;
      continue;
    }

    // Stale otherwise
  }

  return result;
};
