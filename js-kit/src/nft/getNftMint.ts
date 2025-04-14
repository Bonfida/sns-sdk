import { Address, getProgramDerivedAddress } from "@solana/kit";

import { addressCodec, utf8Codec } from "../codecs";
import { NAME_TOKENIZER_ADDRESS } from "../constants/addresses";

const MINT_PREFIX = utf8Codec.encode("tokenized_name");

/**
 * Retrieves the mint address of a tokenized domain.
 *
 * @param domainAddress - The address of the domain to derive the NFT mint from.
 * @returns A promise that resolves to the mint address of the NFT.
 */
export const getNftMint = async (domainAddress: Address) => {
  const [mint] = await getProgramDerivedAddress({
    programAddress: NAME_TOKENIZER_ADDRESS,
    seeds: [MINT_PREFIX, addressCodec.encode(domainAddress)],
  });
  return mint;
};
