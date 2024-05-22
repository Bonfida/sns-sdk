import { Buffer } from "buffer";
import { encode as bs58Encode } from "bs58";
import { PublicKey } from "@solana/web3.js";
import { bech32 } from "@scure/base";
import { decode as decodePunnyCode } from "punycode";
import {
  isValid as isValidIp,
  fromByteArray as ipFromByteArray,
} from "ipaddr.js";
import { RECORD_V1_SIZE, Record } from "../types/record";
import { NameRegistryState } from "../state";
import { InvalidRecordDataError } from "../error";

import { checkSolRecord } from "./checkSolRecord";

const trimNullPaddingIdx = (buffer: Buffer): number => {
  const arr = Array.from(buffer);
  const lastNonNull =
    arr.length - 1 - arr.reverse().findIndex((byte) => byte !== 0);
  return lastNonNull + 1;
};

/**
 * This function can be used to deserialize the content of a record (V1). If the content is invalid it will throw an error
 * @param registry The name registry state object of the record being deserialized
 * @param record The record enum being deserialized
 * @param recordKey The public key of the record being deserialized
 * @returns
 */
export const deserializeRecord = (
  registry: NameRegistryState | undefined,
  record: Record,
  recordKey: PublicKey,
): string | undefined => {
  const buffer = registry?.data;
  if (!buffer) return undefined;
  if (buffer.compare(Buffer.alloc(buffer.length)) === 0) return undefined;

  const size = RECORD_V1_SIZE.get(record);
  const idx = trimNullPaddingIdx(buffer);

  if (!size) {
    const str = buffer.slice(0, idx).toString("utf-8");
    if (record === Record.CNAME || record === Record.TXT) {
      return decodePunnyCode(str);
    }
    return str;
  }

  // Handle SOL record first whether it's over allocated or not
  if (record === Record.SOL) {
    const encoder = new TextEncoder();
    const expectedBuffer = Buffer.concat([
      buffer.slice(0, 32),
      recordKey.toBuffer(),
    ]);
    const expected = encoder.encode(expectedBuffer.toString("hex"));
    const valid = checkSolRecord(
      expected,
      buffer.slice(32, 96),
      registry.owner,
    );
    if (valid) {
      return bs58Encode(buffer.slice(0, 32));
    }
  }

  // Old record UTF-8 encoded
  if (size && idx !== size) {
    const address = buffer.slice(0, idx).toString("utf-8");
    if (record === Record.Injective) {
      const decoded = bech32.decodeToBytes(address);
      if (decoded.prefix === "inj" && decoded.bytes.length === 20) {
        return address;
      }
    } else if (record === Record.BSC || record === Record.ETH) {
      const prefix = address.slice(0, 2);
      const hex = address.slice(2);
      if (prefix === "0x" && Buffer.from(hex, "hex").length === 20) {
        return address;
      }
    } else if (record === Record.A || record === Record.AAAA) {
      if (isValidIp(address)) {
        return address;
      }
    }
    throw new InvalidRecordDataError("The record data is malformed");
  }

  if (record === Record.ETH || record === Record.BSC) {
    return "0x" + buffer.slice(0, size).toString("hex");
  } else if (record === Record.Injective) {
    return bech32.encode("inj", bech32.toWords(buffer.slice(0, size)));
  } else if (record === Record.A || record === Record.AAAA) {
    return ipFromByteArray([...buffer.slice(0, size)]).toString();
  } else if (record === Record.Background) {
    return new PublicKey(buffer.slice(0, size)).toString();
  }
  throw new InvalidRecordDataError("The record data is malformed");
};
