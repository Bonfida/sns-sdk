import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";

import {
  METAPLEX_ID,
  NAME_PROGRAM_ID,
  REGISTER_PROGRAM_ID,
  REVERSE_LOOKUP_CLASS,
  ROOT_DOMAIN_ACCOUNT,
  WOLVES_COLLECTION_METADATA,
} from "../constants";
import { createWithNftInstruction } from "../instructions/createWithNftInstruction";

export const registerWithNft = (
  name: string,
  space: number,
  nameAccount: Address,
  reverseLookupAccount: Address,
  buyer: Address,
  nftSource: Address,
  nftMetadata: Address,
  nftMint: Address,
  masterEdition: Address
) => {
  const [state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID
  );
  const ix = new createWithNftInstruction({ space, name }).getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    nameAccount,
    reverseLookupAccount,
    SystemProgram.programId,
    REVERSE_LOOKUP_CLASS,
    buyer,
    nftSource,
    nftMetadata,
    nftMint,
    masterEdition,
    WOLVES_COLLECTION_METADATA,
    TOKEN_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    state,
    METAPLEX_ID
  );
  return ix;
};
