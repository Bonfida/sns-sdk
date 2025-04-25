import { ReadonlyUint8Array } from "@solana/kit";

import { utf8Codec } from "../../codecs";

interface DeserializeReverseParams {
  data: ReadonlyUint8Array | undefined;
  trimFirstNullByte?: boolean;
}

/**
 * Deserializes reverse account data.
 *
 * @param params - An object containing the following properties:
 *   - `data`: The Uint8Array to deserialize. If undefined, returns undefined.
 *   - `trimFirstNullByte`: (Optional) Whether to trim the first null byte from the result string. Defaults to false.
 * @returns The deserialized string, or undefined if data is undefined.
 */
export function deserializeReverse({
  data,
  trimFirstNullByte,
}: DeserializeReverseParams): string;

export function deserializeReverse({
  data,
  trimFirstNullByte,
}: DeserializeReverseParams): undefined;

export function deserializeReverse({
  data,
  trimFirstNullByte = false,
}: DeserializeReverseParams): string | undefined {
  if (!data) return undefined;

  const view = new DataView(data.buffer);
  const nameLength = view.getUint32(0, true);

  return utf8Codec
    .decode(data.subarray(4, 4 + nameLength))
    .replace(/^\0/, trimFirstNullByte ? "" : "\0");
}
