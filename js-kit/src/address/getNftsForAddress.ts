import {
  Address,
  GetMultipleAccountsApi,
  GetProgramAccountsApi,
  Rpc,
} from "@solana/kit";

import { base64Codec, tokenCodec } from "../codecs";
import { TOKEN_PROGRAM_ADDRESS } from "../constants/addresses";
import { NftState } from "../states/nft";
import { reverseLookupBatch } from "../utils/reverseLookupBatch";

interface GetNftsForAddressParams {
  rpc: Rpc<GetMultipleAccountsApi & GetProgramAccountsApi>;
  address: Address;
}

interface Result {
  domain: string;
  domainAddress: Address;
  mint: Address;
}

/**
 * Fetches NFT states for a given address.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetProgramAccountsApi.
 *   - `address`: The address whose associated NFT states are to be fetched.
 * @returns A promise resolving to an array of NftState objects.
 */
const getNftStatesForAddress = async ({
  rpc,
  address,
}: {
  rpc: Rpc<GetProgramAccountsApi>;
  address: Address;
}): Promise<NftState[]> => {
  try {
    const results = await rpc
      .getProgramAccounts(TOKEN_PROGRAM_ADDRESS, {
        encoding: "base64",
        filters: [
          {
            memcmp: { offset: 32n, bytes: address, encoding: "base58" },
          },
          { memcmp: { offset: 64n, bytes: "2", encoding: "base58" } },
          { dataSize: 165n },
        ],
      })
      .send();

    const nftStates = await Promise.all(
      results.map(({ account }) => {
        const { mint } = tokenCodec.decode(base64Codec.encode(account.data[0]));
        return NftState.retrieveFromMint(rpc, mint).catch(() => undefined);
      })
    );

    return nftStates.filter((state) => state !== undefined);
  } catch (error) {
    console.error("Error retrieving NFT records:", error);
    return [];
  }
};

/**
 * Retrieves NFTs owned by a given address.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetMultipleAccountsApi and GetProgramAccountsApi.
 *   - `address`: The address for which NFTs are to be fetched.
 * @returns A promise resolving to an array of Result objects containing domain, domainAddress, and mint.
 */
export const getNftsForAddress = async ({
  rpc,
  address,
}: GetNftsForAddressParams): Promise<Result[]> => {
  const nftStates = await getNftStatesForAddress({ rpc, address });
  const nftNameAccounts = nftStates.map((state) => state.nameAccount);
  const domains = await reverseLookupBatch({
    rpc,
    domainAddresses: nftNameAccounts,
  });

  return domains
    .map((domain, idx) =>
      domain
        ? {
            domain,
            domainAddress: nftStates[idx].nameAccount,
            mint: nftStates[idx].nftMint,
          }
        : undefined
    )
    .filter((e) => e !== undefined);
};
