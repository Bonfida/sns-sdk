import { Buffer } from "buffer";

export function deserializeReverse(
  data: Buffer,
  trimFirstNullByte?: boolean,
): string;
export function deserializeReverse(
  data: undefined,
  trimFirstNullByte?: boolean,
): undefined;

export function deserializeReverse(
  data: Buffer | undefined,
  trimFirstNullByte = false,
): string | undefined {
  if (!data) return undefined;
  const nameLength = data.slice(0, 4).readUInt32LE(0);
  return data
    .slice(4, 4 + nameLength)
    .toString()
    .replace(/^\0/, trimFirstNullByte ? "" : "\0");
}
