import { bech32 } from "@scure/base";
import { ReadonlyUint8Array } from "@solana/kit";
import { fromByteArray as ipFromByteArray } from "ipaddr.js";
import { decode as decodePunnycode } from "punycode/";

import { addressCodec, utf8Codec } from "../../codecs";
import { EVM_RECORDS, UTF8_ENCODED_RECORDS } from "../../constants/records";
import { InvalidRecordDataError } from "../../errors";
import { Record } from "../../types/record";
import { uint8ArrayToHex } from "../uint8Array/uint8ArrayToHex";

/**
 * This function deserializes a buffer based on the type of record it corresponds to
 * If the record is not properly serialized according to SNS-IP 1 this function will throw an error
 * @param content The content to deserialize
 * @param record The type of record
 * @returns The deserialized content as a string
 */
export const deserializeRecordContent = (
  content: ReadonlyUint8Array,
  record: Record
): string => {
  const isUtf8Encoded = UTF8_ENCODED_RECORDS.has(record);

  if (isUtf8Encoded) {
    const decoded = utf8Codec.decode(content);
    if (record === Record.CNAME || record === Record.TXT) {
      return decodePunnycode(decoded);
    }
    return decoded;
  } else if (record === Record.SOL) {
    return addressCodec.decode(content);
  } else if (EVM_RECORDS.has(record)) {
    return `0x${uint8ArrayToHex(content)}`;
  } else if (record === Record.Injective) {
    return bech32.encode("inj", bech32.toWords(content as Uint8Array));
  } else if (record === Record.A || record === Record.AAAA) {
    return ipFromByteArray(Array.from(content)).toString();
  } else {
    throw new InvalidRecordDataError("The record content is malformed");
  }
};
