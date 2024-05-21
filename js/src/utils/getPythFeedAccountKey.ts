import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { DEFAULT_PYTH_PUSH_PROGRAM } from "../constants";

export const getPythFeedAccountKey = (shard: number, priceFeed: number[]) => {
  const buffer = Buffer.alloc(2);
  buffer.writeUint16LE(shard);
  return PublicKey.findProgramAddressSync(
    [buffer, Buffer.from(priceFeed)],
    DEFAULT_PYTH_PUSH_PROGRAM,
  );
};
