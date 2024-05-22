import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { bech32 } from "@scure/base";
import { encode as encodePunycode } from "punycode";
import { parse as parseIp } from "ipaddr.js";
import { RECORD_V1_SIZE, Record } from "../types/record";
import { check } from "../utils/check";
import {
  InvalidAAAARecordError,
  InvalidARecordError,
  InvalidEvmAddressError,
  InvalidInjectiveAddressError,
  InvalidRecordInputError,
  UnsupportedRecordError,
} from "../error";

/**
 * This function can be used to serialize a user input string into a buffer that will be stored into a record account data
 * For serializing SOL records use `serializeSolRecord`
 * @param str The string being serialized into the record account data
 * @param record The record enum being serialized
 * @returns
 */
export const serializeRecord = (str: string, record: Record): Buffer => {
  const size = RECORD_V1_SIZE.get(record);

  if (!size) {
    if (record === Record.CNAME || record === Record.TXT) {
      str = encodePunycode(str);
    }
    return Buffer.from(str, "utf-8");
  }

  if (record === Record.SOL) {
    throw new UnsupportedRecordError("Use `serializeSolRecord` for SOL record");
  } else if (record === Record.ETH || record === Record.BSC) {
    check(
      str.slice(0, 2) === "0x",
      new InvalidEvmAddressError("The record content must start with `0x`"),
    );
    return Buffer.from(str.slice(2), "hex");
  } else if (record === Record.Injective) {
    const decoded = bech32.decodeToBytes(str);
    check(
      decoded.prefix === "inj",
      new InvalidInjectiveAddressError(
        "The record content must start with `inj",
      ),
    );
    check(
      decoded.bytes.length === 20,
      new InvalidInjectiveAddressError(`The record data must be 20 bytes long`),
    );
    return Buffer.from(decoded.bytes);
  } else if (record === Record.A) {
    const array = parseIp(str).toByteArray();
    check(
      array.length === 4,
      new InvalidARecordError(`The record content must be 4 bytes long`),
    );
    return Buffer.from(array);
  } else if (record === Record.AAAA) {
    const array = parseIp(str).toByteArray();
    check(
      array.length === 16,
      new InvalidAAAARecordError(`The record content must be 16 bytes logn`),
    );
    return Buffer.from(array);
  } else if (record === Record.Background) {
    return new PublicKey(str).toBuffer();
  }
  throw new InvalidRecordInputError(`The provided record data is invalid`);
};
