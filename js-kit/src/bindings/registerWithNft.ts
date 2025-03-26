import { Address, getProgramDerivedAddress } from "@solana/kit";

import { addressCodec } from "../codecs";
import {
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

export const registerWithNft = async (
  name: string,
  space: number,
  domainAddress: Address,
  reverseLookupAccount: Address,
  buyer: Address,
  nftSource: Address,
  nftMetadata: Address,
  nftMint: Address,
  masterEdition: Address
) => {
  const [state] = await getProgramDerivedAddress({
    programAddress: REGISTRY_PROGRAM_ADDRESS,
    seeds: [addressCodec.encode(domainAddress)],
  });

  const ix = new createWithNftInstruction({ space, name }).getInstruction(
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
