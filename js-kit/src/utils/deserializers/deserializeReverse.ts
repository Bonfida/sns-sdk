/**
 * Deserializes reverse account data
 *
 * @param {Uint8Array | undefined} data - The Uint8Array to deserialize. If undefined, returns undefined.
 * @param {boolean} [trimFirstNullByte=false] - Whether to trim the first null byte from the result string.
 * @returns {string | undefined} - The deserialized string, or undefined if data is undefined.
 */
import { utf8Codec } from "../../codecs";

export function deserializeReverse(
  data: Uint8Array,
  trimFirstNullByte?: boolean
): string;

export function deserializeReverse(
  data: undefined,
  trimFirstNullByte?: boolean
): undefined;

export function deserializeReverse(
  data: Uint8Array | undefined,
  trimFirstNullByte = false
): string | undefined {
  if (!data) return undefined;

  const view = new DataView(data.buffer);
  const nameLength = view.getUint32(0, true);

  return utf8Codec
    .decode(data.subarray(4, 4 + nameLength))
    .replace(/^\0/, trimFirstNullByte ? "" : "\0");
}
