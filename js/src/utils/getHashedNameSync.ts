import { Buffer } from "buffer";
import { sha256 } from "@noble/hashes/sha256";
import { HASH_PREFIX } from "../constants";

export const getHashedNameSync = (name: string): Buffer => {
  const input = HASH_PREFIX + name;
  const hashed = sha256(Buffer.from(input, "utf8"));
  return Buffer.from(hashed);
};
