import { PublicKey, SystemProgram } from "@solana/web3.js";
import { burnInstruction } from "../instructions/burnInstruction";
import {
  NAME_PROGRAM_ID,
  REGISTER_PROGRAM_ID,
  REVERSE_LOOKUP_CLASS,
} from "../constants";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { getReverseKeySync } from "../utils/getReverseKeySync";

export const burnDomain = (
  domain: string,
  owner: PublicKey,
  target: PublicKey,
) => {
  const { pubkey } = getDomainKeySync(domain);
  const [state] = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer()],
    REGISTER_PROGRAM_ID,
  );
  const [resellingState] = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer(), Uint8Array.from([1, 1])],
    REGISTER_PROGRAM_ID,
  );

  const ix = new burnInstruction().getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    SystemProgram.programId,
    pubkey,
    getReverseKeySync(domain),
    resellingState,
    state,
    REVERSE_LOOKUP_CLASS,
    owner,
    target,
  );
  return ix;
};
