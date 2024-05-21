import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { NAME_PROGRAM_ID } from "../constants";

export const getNameAccountKeySync = (
  hashed_name: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): PublicKey => {
  const seeds = [hashed_name];
  if (nameClass) {
    seeds.push(nameClass.toBuffer());
  } else {
    seeds.push(Buffer.alloc(32));
  }
  if (nameParent) {
    seeds.push(nameParent.toBuffer());
  } else {
    seeds.push(Buffer.alloc(32));
  }
  const [nameAccountKey] = PublicKey.findProgramAddressSync(
    seeds,
    NAME_PROGRAM_ID,
  );
  return nameAccountKey;
};
