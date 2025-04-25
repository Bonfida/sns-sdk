import { ReadonlyUint8Array } from "@solana/kit";

/**
 * Converts a Uint8Array to a hexadecimal string.
 * @param {ReadonlyUint8Array} arr - The Uint8Array to be converted.
 * @returns {string} The resulting hexadecimal string.
 */
export const uint8ArrayToHex = (arr: ReadonlyUint8Array) =>
  Array.from(arr)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
