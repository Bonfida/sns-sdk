import { PublicKey } from "@solana/web3.js";
import { createCloseAccountInstruction } from "@solana/spl-token";

export const unwrapSol = (ata: PublicKey, owner: PublicKey) => {
  const ix = createCloseAccountInstruction(ata, owner, owner);
  return [ix];
};
