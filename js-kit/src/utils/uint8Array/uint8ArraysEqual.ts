import { ReadonlyUint8Array } from "@solana/kit";

/**
 * Compares two Uint8Array objects for equality.
 *
 * @param {Uint8Array} arr1 - The first Uint8Array to compare.
 * @param {Uint8Array} arr2 - The second Uint8Array to compare.
 * @returns {boolean} - True if both arrays are equal, false otherwise.
 */
export const uint8ArraysEqual = (
  arr1: ReadonlyUint8Array,
  arr2: ReadonlyUint8Array
): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((value, index) => value === arr2[index]);
};
