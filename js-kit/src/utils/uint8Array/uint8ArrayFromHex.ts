/**
 * Converts a Uint8Array to a hexadecimal string.
 * @param {Uint8Array} arr - The Uint8Array to be converted.
 * @returns {string} The resulting hexadecimal string.
 */
export const uint8ArrayFromHex = (hexString: string) => {
  const uint8Array = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    uint8Array[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
  }
  return uint8Array;
};
