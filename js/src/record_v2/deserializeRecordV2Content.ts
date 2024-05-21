import { Record } from "../types/record";
import { InvalidRecordDataError } from "../error";
import { PublicKey } from "@solana/web3.js";
import { decode as decodePunnycode } from "punycode";
import { bech32 } from "@scure/base";
import { fromByteArray as ipFromByteArray } from "ipaddr.js";

import { UTF8_ENCODED, EVM_RECORDS } from "./const";

/**
 * This function deserializes a buffer based on the type of record it corresponds to
 * If the record is not properly serialized according to SNS-IP 1 this function will throw an error
 * @param content The content to deserialize
 * @param record The type of record
 * @returns The deserialized content as a string
 */
export const deserializeRecordV2Content = (
  content: Buffer,
  record: Record,
): string => {
  const utf8Encoded = UTF8_ENCODED.has(record);

  if (utf8Encoded) {
    const decoded = content.toString("utf-8");
    if (record === Record.CNAME || record === Record.TXT) {
      return decodePunnycode(decoded);
    }
    return decoded;
  } else if (record === Record.SOL) {
    return new PublicKey(content).toBase58();
  } else if (EVM_RECORDS.has(record)) {
    return "0x" + content.toString("hex");
  } else if (record === Record.Injective) {
    return bech32.encode("inj", bech32.toWords(content));
  } else if (record === Record.A || record === Record.AAAA) {
    return ipFromByteArray([...content]).toString();
  } else {
    throw new InvalidRecordDataError("The record content is malformed");
  }
};
