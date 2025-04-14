import { Address, getProgramDerivedAddress } from "@solana/kit";

import { addressCodec, utf8Codec } from "../codecs";
import {
  CENTRAL_STATE,
  METAPLEX_PROGRAM_ADDRESS,
  NAME_PROGRAM_ADDRESS,
  REGISTRY_PROGRAM_ADDRESS,
  REVERSE_LOOKUP_CLASS,
  ROOT_DOMAIN_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
  SYSVAR_RENT_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
  WOLVES_COLLECTION_METADATA,
} from "../constants/addresses";
import { createWithNftInstruction } from "../instructions/createWithNftInstruction";
import { deriveAddress } from "../utils/deriveAddress";

/**
 * Registers a .sol domain using a Bonfida Wolves NFT.
 *
 * @param domain - The domain name to be registered.
 * @param space - The space in bytes to be allocated for the domain registry.
 * @param buyer - The address of the buyer registering the domain.
 * @param nftSource - The address of the NFT source account.
 * @param nftMint - The mint address of the NFT used for registration.
 * @returns A promise which resolves to the register with NFT instruction.
 */
export const registerWithNft = async (
  domain: string,
  space: number,
  buyer: Address,
  nftSource: Address,
  nftMint: Address
) => {
  const domainAddress = await deriveAddress(domain, ROOT_DOMAIN_ADDRESS);
  const reverseLookupAccount = await deriveAddress(
    domainAddress,
    undefined,
    CENTRAL_STATE
  );

  const [state] = await getProgramDerivedAddress({
    programAddress: REGISTRY_PROGRAM_ADDRESS,
    seeds: [addressCodec.encode(domainAddress)],
  });
  const [nftMetadata] = await getProgramDerivedAddress({
    programAddress: METAPLEX_PROGRAM_ADDRESS,
    seeds: [
      utf8Codec.encode("metadata"),
      addressCodec.encode(METAPLEX_PROGRAM_ADDRESS),
      addressCodec.encode(nftMint),
    ],
  });
  const [masterEdition] = await getProgramDerivedAddress({
    programAddress: METAPLEX_PROGRAM_ADDRESS,
    seeds: [
      utf8Codec.encode("metadata"),
      addressCodec.encode(METAPLEX_PROGRAM_ADDRESS),
      addressCodec.encode(nftMint),
      utf8Codec.encode("edition"),
    ],
  });

  const ix = new createWithNftInstruction({
    space,
    name: domain,
  }).getInstruction(
    REGISTRY_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    ROOT_DOMAIN_ADDRESS,
    domainAddress,
    reverseLookupAccount,
    SYSTEM_PROGRAM_ADDRESS,
    REVERSE_LOOKUP_CLASS,
    buyer,
    nftSource,
    nftMetadata,
    nftMint,
    masterEdition,
    WOLVES_COLLECTION_METADATA,
    TOKEN_PROGRAM_ADDRESS,
    SYSVAR_RENT_ADDRESS,
    state,
    METAPLEX_PROGRAM_ADDRESS
  );
  return ix;
};
