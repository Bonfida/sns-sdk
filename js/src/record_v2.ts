import { Record } from "./types/record";
import { ErrorType, SNSError } from "./error";
import { Connection, PublicKey } from "@solana/web3.js";
import { encode as encodePunycode, decode as decodePunnycode } from "punycode";
import {
  check,
  getDomainKeySync,
  getHashedNameSync,
  getNameAccountKeySync,
} from "./utils";
import { decode, encode } from "bech32-buffer";
import ipaddr from "ipaddr.js";
import {
  CENTRAL_STATE_SNS_RECORDS,
  Record as SnsRecord,
  Validation,
} from "@bonfida/sns-records";
import { resolve } from "./resolve";

export const GUARDIANS = new Map<Record, PublicKey>([
  [
    Record.Backpack,
    new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3"),
  ],
  [Record.Url, new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3")],
]);

export const verifyStaleness = async (
  connection: Connection,
  record: Record,
  domain: string
) => {
  const recordKey = getRecordV2Key(domain, record);
  const owner = await resolve(connection, domain);
  const recordObj = await SnsRecord.retrieve(connection, recordKey);

  const stalenessId = recordObj.getStalenessId();
  if (stalenessId.length !== 32) {
    return false;
  }

  return (
    owner.equals(new PublicKey(stalenessId)) &&
    recordObj.header.stalenessValidation === Validation.Solana
  );
};

export const verifyRightOfAssociation = async (
  connection: Connection,
  record: Record,
  domain: string,
  verifier: Buffer
) => {
  const recordKey = getRecordV2Key(domain, record);
  const recordObj = await SnsRecord.retrieve(connection, recordKey);

  const roaId = recordObj.getRoAId();

  return verifier.compare(roaId) === 0;
};

/**
 * Set of records that are UTF-8 encoded strings
 */
export const UTF8_ENCODED = new Set<Record>([
  Record.IPFS,
  Record.ARWV,
  Record.LTC,
  Record.DOGE,
  Record.Email,
  Record.Url,
  Record.Discord,
  Record.Github,
  Record.Reddit,
  Record.Twitter,
  Record.Telegram,
  Record.Pic,
  Record.SHDW,
  Record.POINT,
  Record.Backpack,
  Record.TXT,
  Record.CNAME,
  Record.BTC,
]);

/**
 * Set of records that are self signed i.e signed by the public key contained
 * in the record itself.
 */
export const SELF_SIGNED = new Set<Record>([
  Record.ETH,
  Record.Injective,
  Record.SOL,
]);

/**
 * This function deserializes a buffer based on the type of record it corresponds to
 * If the record is not properly serialized according to SNS-IP 1 this function will throw an error
 * @param content The content to deserialize
 * @param record The type of record
 * @returns The deserialized content as a string
 */
export const deserializeRecordV2Content = (
  content: Buffer,
  record: Record
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
  } else if (record === Record.ETH || record === Record.BSC) {
    return "0x" + content.toString("hex");
  } else if (record === Record.Injective) {
    return encode("inj", content, "bech32");
  } else if (record === Record.A || record === Record.AAAA) {
    return ipaddr.fromByteArray([...content]).toString();
  } else {
    throw new SNSError(ErrorType.InvalidARecord);
  }
};

/**
 * This function serializes a string based on the type of record it corresponds to
 * The serialization follows the SNS-IP 1 guideline
 * @param content The content to serialize
 * @param record The type of record
 * @returns The serialized content as a buffer
 */
export const serializeRecordV2Content = (
  content: string,
  record: Record
): Buffer => {
  const utf8Encoded = UTF8_ENCODED.has(record);
  if (utf8Encoded) {
    if (record === Record.CNAME || record === Record.TXT) {
      content = encodePunycode(content);
    }
    return Buffer.from(content, "utf-8");
  } else if (record === Record.SOL) {
    return new PublicKey(content).toBuffer();
  } else if (record === Record.ETH || record === Record.BSC) {
    check(content.slice(0, 2) === "0x", ErrorType.InvalidEvmAddress);
    return Buffer.from(content.slice(2), "hex");
  } else if (record === Record.Injective) {
    const decoded = decode(content);
    check(decoded.prefix === "inj", ErrorType.InvalidInjectiveAddress);
    check(decoded.data.length === 20, ErrorType.InvalidInjectiveAddress);
    return Buffer.from(decoded.data);
  } else if (record === Record.A) {
    const array = ipaddr.parse(content).toByteArray();
    check(array.length === 4, ErrorType.InvalidARecord);
    return Buffer.from(array);
  } else if (record === Record.AAAA) {
    const array = ipaddr.parse(content).toByteArray();
    check(array.length === 16, ErrorType.InvalidAAAARecord);
    return Buffer.from(array);
  } else {
    throw new SNSError(ErrorType.InvalidARecord);
  }
};

/**
 * This function derives a record v2 key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns Public key of the record
 */
export const getRecordV2Key = (domain: string, record: Record): PublicKey => {
  const { pubkey } = getDomainKeySync(domain);
  const hashed = getHashedNameSync(`\x02`.concat(record as string));
  return getNameAccountKeySync(hashed, CENTRAL_STATE_SNS_RECORDS, pubkey);
};
