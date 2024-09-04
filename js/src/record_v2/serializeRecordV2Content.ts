import { PublicKey } from "@solana/web3.js";
import { encode as encodePunycode } from "punycode";
import { bech32 } from "@scure/base";
import { parse as parseIp } from "ipaddr.js";
import { check } from "../utils/check";
import { Record } from "../types/record";
import {
  InvalidAAAARecordError,
  InvalidARecordError,
  InvalidEvmAddressError,
  InvalidInjectiveAddressError,
  InvalidRecordInputError,
} from "../error";
import { Buffer } from "buffer";
import { UTF8_ENCODED, EVM_RECORDS } from "./const";

/**
 * This function serializes a string based on the type of record it corresponds to
 * The serialization follows the SNS-IP 1 guideline
 * @param content The content to serialize
 * @param record The type of record
 * @returns The serialized content as a buffer
 */
export const serializeRecordV2Content = (
  content: string,
  record: Record,
): Buffer => {
  const utf8Encoded = UTF8_ENCODED.has(record);
  if (utf8Encoded) {
    if (record === Record.CNAME || record === Record.TXT) {
      content = encodePunycode(content);
    }
    return Buffer.from(content, "utf-8");
  } else if (record === Record.SOL) {
    return new PublicKey(content).toBuffer();
  } else if (EVM_RECORDS.has(record)) {
    check(
      content.slice(0, 2) === "0x",
      new InvalidEvmAddressError("The record content must start with `0x`"),
    );
    return Buffer.from(content.slice(2), "hex");
  } else if (record === Record.Injective) {
    const decoded = bech32.decodeToBytes(content);
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
    const array = parseIp(content).toByteArray();
    check(
      array.length === 4,
      new InvalidARecordError("The record content must be 4 bytes long"),
    );
    return Buffer.from(array);
  } else if (record === Record.AAAA) {
    const array = parseIp(content).toByteArray();
    check(
      array.length === 16,
      new InvalidAAAARecordError("The record content must be 16 bytes long"),
    );
    return Buffer.from(array);
  } else {
    throw new InvalidRecordInputError("The record content is malformed");
  }
};
