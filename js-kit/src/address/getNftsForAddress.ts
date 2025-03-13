import {
  Address,
  GetMultipleAccountsApi,
  GetProgramAccountsApi,
  Rpc,
} from "@solana/kit";

import { base64Codec, tokenCodec } from "../codecs";
import { TOKEN_PROGRAM_ID } from "../constants/addresses";
import { NftState } from "../states/nft";
import { reverseLookupBatch } from "../utils/reverseLookupBatch";

interface Result {
  domain: string;
  domainAddress: Address;
  mint: Address;
}

/**
 * Retrieves the NFT states for a given address.
 * @param {Rpc<GetProgramAccountsApi>} rpc - The RPC instance to interact with
 *     the blockchain.
 * @param {Address} address - The address to check.
 * @returns {Promise<NftState[]>} - A promise that resolves to an array of NFT states.
 */
const getNftStatesForAddress = async (
  rpc: Rpc<GetProgramAccountsApi>,
  address: Address
): Promise<NftState[]> => {
  try {
    const results = await rpc
      .getProgramAccounts(TOKEN_PROGRAM_ID, {
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
 * Retrieves the NFTs associated with a given address.
 * @param {Rpc<GetMultipleAccountsApi & GetProgramAccountsApi>} rpc - The RPC
 *     instance to interact with the blockchain.
 * @param {Address} address - The address to check.
 * @returns {Promise<Result[]>}
 *     - A promise that resolves to an array of NFT details, including the domain,
 *     domain address, and mint.
 */
export const getNftsForAddress = async (
  rpc: Rpc<GetMultipleAccountsApi & GetProgramAccountsApi>,
  address: Address
): Promise<Result[]> => {
  const nftStates = await getNftStatesForAddress(rpc, address);
  const nftNameAccounts = nftStates.map((state) => state.nameAccount);
  const domains = await reverseLookupBatch(rpc, nftNameAccounts);

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
