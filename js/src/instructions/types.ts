import { PublicKey } from "@solana/web3.js";

export interface AccountKey {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}
