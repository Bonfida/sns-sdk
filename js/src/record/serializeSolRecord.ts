import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { check } from "../utils/check";
import { InvalidSignatureError } from "../error";

import { checkSolRecord } from "./checkSolRecord";

/**
 * This function can be used to build the content of a SOL record
 * @param content The public key being stored in the SOL record
 * @param recordKey The record public key
 * @param signer The signer of the record i.e the domain owner
 * @param signature The signature of the record's content
 * @returns
 */
export const serializeSolRecord = (
  content: PublicKey,
  recordKey: PublicKey,
  signer: PublicKey,
  signature: Uint8Array,
): Buffer => {
  const expected = Buffer.concat([content.toBuffer(), recordKey.toBuffer()]);
  const encodedMessage = new TextEncoder().encode(expected.toString("hex"));
  const valid = checkSolRecord(encodedMessage, signature, signer);
  check(valid, new InvalidSignatureError("The SOL signature is invalid"));

  return Buffer.concat([content.toBuffer(), signature]);
};
