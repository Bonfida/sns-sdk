import {
  Address,
  GetAccountInfoApi,
  GetTokenLargestAccountsApi,
  Rpc,
  SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
  fetchEncodedAccount,
  isSolanaError,
} from "@solana/kit";

import { tokenCodec } from "../codecs";
import { getNftMint } from "./getNftMint";

interface GetNftOwnerParams {
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>;
  domainAddress: Address;
}

/**
 * Retrieves the owner of a tokenized domain.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi and GetTokenLargestAccountsApi.
 *   - `domainAddress`: The address of the domain whose owner is to be retrieved.
 * @returns A promise that resolves to the NFT owner's address, or null if no owner is found.
 */
export const getNftOwner = async ({
  rpc,
  domainAddress,
}: GetNftOwnerParams): Promise<Address | null> => {
  try {
    const mint = await getNftMint({ domainAddress });
    const largestAccounts = await rpc.getTokenLargestAccounts(mint).send();

    if (largestAccounts.value.length === 0) {
      return null;
    }

    const largestAccountInfo = await fetchEncodedAccount(
      rpc,
      largestAccounts.value[0].address
    );

    if (!largestAccountInfo.exists) {
      return null;
    }

    const decoded = tokenCodec.decode(largestAccountInfo.data);
    if (decoded.amount.toString() === "1") {
      return decoded.owner;
    }

    return null;
  } catch (err) {
    if (isSolanaError(err, SOLANA_ERROR__JSON_RPC__INVALID_PARAMS)) {
      return null;
    }
    throw err;
  }
};
