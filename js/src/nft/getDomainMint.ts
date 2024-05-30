import { PublicKey } from "@solana/web3.js";
import { MINT_PREFIX, NAME_TOKENIZER_ID } from "./const";

export const getDomainMint = (domain: PublicKey) => {
  const [mint] = PublicKey.findProgramAddressSync(
    [MINT_PREFIX, domain.toBuffer()],
    NAME_TOKENIZER_ID,
  );
  return mint;
};
