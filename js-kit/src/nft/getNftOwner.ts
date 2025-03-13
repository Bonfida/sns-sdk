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

export const getNftOwner = async (
  rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>,
  domainAddress: Address
) => {
  try {
    const mint = await getNftMint(domainAddress);
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
