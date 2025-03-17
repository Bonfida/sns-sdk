import { ReadonlyUint8Array } from "@solana/kit";

/**
 * Concatenates an array of Uint8Array instances into a single Uint8Array.
 *
 * @param arrays - An array of Uint8Array objects to concatenate.
 * @returns A new Uint8Array containing the concatenated data from all input arrays.
 */
export const uint8ArraysConcat = (
  arrays: (Uint8Array | ReadonlyUint8Array)[]
): Uint8Array => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  arrays.forEach((arr) => {
    result.set(arr, offset);
    offset += arr.length;
  });

  return result;
};
