import { PublicKey } from "@solana/web3.js";
import { ed25519 } from "@noble/curves/ed25519";

/**
 * This function can be used to verify the validity of a SOL record
 * @param record The record data to verify
 * @param signedRecord The signed data
 * @param pubkey The public key of the signer
 * @returns
 */
export const checkSolRecord = (
  record: Uint8Array,
  signedRecord: Uint8Array,
  pubkey: PublicKey,
) => {
  return ed25519.verify(signedRecord, record, pubkey.toBytes());
};
