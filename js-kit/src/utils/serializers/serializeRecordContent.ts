import { bech32 } from "@scure/base";
import { Address, ReadonlyUint8Array } from "@solana/kit";
import { parse as parseIp } from "ipaddr.js";
import { encode as encodePunycode } from "punycode/";

import { addressCodec, utf8Codec } from "../../codecs";
import { EVM_RECORDS, UTF8_ENCODED_RECORDS } from "../../constants/records";
import {
  InvalidAAAARecordError,
  InvalidARecordError,
  InvalidEvmAddressError,
  InvalidInjectiveAddressError,
  InvalidRecordInputError,
} from "../../errors";
import { Record } from "../../types/record";
import { _check } from "../check";
import { uint8ArrayFromHex } from "../uint8Array/uint8ArrayFromHex";

export const serializeRecordContent = (
  content: string,
  record: Record
): ReadonlyUint8Array => {
  const utf8Encoded = UTF8_ENCODED_RECORDS.has(record);
  if (utf8Encoded) {
    if (record === Record.CNAME || record === Record.TXT) {
      content = encodePunycode(content);
    }
    return utf8Codec.encode(content);
  } else if (record === Record.SOL) {
    return addressCodec.encode(content as Address);
  } else if (EVM_RECORDS.has(record)) {
    _check(
      content.slice(0, 2) === "0x",
      new InvalidEvmAddressError("The record content must start with `0x`")
    );
    _check(
      content.length === 42,
      new InvalidEvmAddressError(
        "The record content must be 42 characters long"
      )
    );
    return uint8ArrayFromHex(content.slice(2));
  } else if (record === Record.Injective) {
    const decoded = bech32.decodeToBytes(content);
    _check(
      decoded.prefix === "inj" && content.length === 42,
      new InvalidInjectiveAddressError(
        "The record content must start with `inj`"
      )
    );
    _check(
      decoded.bytes.length === 20,
      new InvalidInjectiveAddressError("The record data must be 20 bytes long")
    );
    return decoded.bytes;
  } else if (record === Record.A) {
    const array = parseIp(content).toByteArray();
    _check(
      array.length === 4,
      new InvalidARecordError("The record content must be 4 bytes long")
    );
    return new Uint8Array(array);
  } else if (record === Record.AAAA) {
    const array = parseIp(content).toByteArray();
    _check(
      array.length === 16,
      new InvalidAAAARecordError("The record content must be 16 bytes long")
    );
    return new Uint8Array(array);
  } else {
    throw new InvalidRecordInputError("The record content is malformed");
  }
};
