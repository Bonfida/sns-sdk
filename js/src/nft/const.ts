import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export const NAME_TOKENIZER_ID = new PublicKey(
  "nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk",
);

export const MINT_PREFIX = Buffer.from("tokenized_name");
