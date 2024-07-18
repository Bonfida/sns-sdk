import { Buffer } from "buffer";

export function deserializeReverse(data: Buffer): string;
export function deserializeReverse(data: undefined): undefined;

export function deserializeReverse(
  data: Buffer | undefined,
): string | undefined {
  if (!data) return undefined;
  const nameLength = data.slice(0, 4).readUInt32LE(0);
  return data
    .slice(4, 4 + nameLength)
    .toString()
    .replace(/\0/g, "");
}
