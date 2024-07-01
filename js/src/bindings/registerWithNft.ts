import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { createWithNftInstruction } from "../instructions/createWithNftInstruction";
import {
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  REGISTER_PROGRAM_ID,
  REVERSE_LOOKUP_CLASS,
  WOLVES_COLLECTION_METADATA,
  METAPLEX_ID,
} from "../constants";

export const registerWithNft = (
  name: string,
  space: number,
  nameAccount: PublicKey,
  reverseLookupAccount: PublicKey,
  buyer: PublicKey,
  nftSource: PublicKey,
  nftMetadata: PublicKey,
  nftMint: PublicKey,
  masterEdition: PublicKey,
) => {
  const [state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID,
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
    METAPLEX_ID,
  );
  return ix;
};
