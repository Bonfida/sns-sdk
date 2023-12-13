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

/**
 * A map that associates each record type with a public key, known as guardians.
 */
export const GUARDIANS = new Map<Record, PublicKey>([
  [
    Record.Backpack,
    new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3"),
  ],
  [Record.Url, new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3")],
]);

/**
 * Set of records that utilize secp256k1 for verification purposes
 */
export const ETH_ROA_RECORDS = new Set<Record>([
  Record.ETH,
  Record.Injective,
  Record.BSC,
]);

/**
 * This function verifies the staleness of a record.
 * @param {Connection} connection - The Solana RPC connection object
 * @param {Record} record - The record to be verified.
 * @param {string} domain - The domain associated with the record.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating whether the record is stale.
 */
export const verifyStaleness = async (
  connection: Connection,
  record: Record,
  domain: string,
) => {
  const recordKey = getRecordV2Key(domain, record);
  const owner = await resolve(connection, domain);
  const recordObj = await SnsRecord.retrieve(connection, recordKey);

  const stalenessId = recordObj.getStalenessId();

  return (
    owner.equals(new PublicKey(stalenessId)) &&
    recordObj.header.stalenessValidation === Validation.Solana
  );
};

/**
 *
 * This function verifies the right of association of a record.
 * Note: This function does not verify if the record is stale.
 * Users must verify staleness in addition to the right of association.
 * @param {Connection} connection - The Solana RPC connection object
 * @param {Record} record - The record to be verified.
 * @param {string} domain - The domain associated with the record.
 * @param {Buffer} verifier - The optional verifier to be used in the verification process.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating whether the record has the right of association.
 */
export const verifyRightOfAssociation = async (
  connection: Connection,
  record: Record,
  domain: string,
  verifier?: Buffer,
) => {
  const recordKey = getRecordV2Key(domain, record);
  const recordObj = await SnsRecord.retrieve(connection, recordKey);

  const roaId = recordObj.getRoAId();

  const validation = ETH_ROA_RECORDS.has(record)
    ? Validation.Ethereum
    : Validation.Solana;

  verifier = verifier ?? GUARDIANS.get(record)?.toBuffer();
  if (!verifier) throw new SNSError(ErrorType.MissingVerifier);

  return (
    verifier.compare(roaId) === 0 &&
    recordObj.header.rightOfAssociationValidation === validation
  );
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

export interface GetRecordV2Options {
  deserialize?: boolean;
}

export interface RecordResult {
  retrievedRecord: SnsRecord;
  record: Record;
  deserializedContent?: string;
}

export type SingleRecordResult = Omit<RecordResult, "record">;

/**
 * This function can be used to retrieve a specified record V2 for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export async function getRecordV2(
  connection: Connection,
  domain: string,
  record: Record,
  options: GetRecordV2Options = {},
): Promise<SingleRecordResult> {
  const pubkey = getRecordV2Key(domain, record);
  const retrievedRecord = await SnsRecord.retrieve(connection, pubkey);

  if (options.deserialize) {
    return {
      retrievedRecord,
      deserializedContent: deserializeRecordV2Content(
        retrievedRecord.getContent(),
        record,
      ),
    };
  }

  return { retrievedRecord };
}

/**
 * This function can be used to retrieve multiple records V2 for a given domain
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export async function getMultipleRecordsV2(
  connection: Connection,
  domain: string,
  records: Record[],
  options: GetRecordV2Options = {},
): Promise<(RecordResult | undefined)[]> {
  const pubkeys = records.map((record) => getRecordV2Key(domain, record));
  const retrievedRecords = await SnsRecord.retrieveBatch(connection, pubkeys);

  if (options.deserialize) {
    return retrievedRecords.map((e, idx) => {
      if (!e) return undefined;
      return {
        retrievedRecord: e,
        record: records[idx],
        deserializedContent: deserializeRecordV2Content(
          e.getContent(),
          records[idx],
        ),
      };
    });
  }

  return retrievedRecords.map((e, idx) => {
    if (!e) return undefined;
    return {
      retrievedRecord: e,
      record: records[idx],
    };
  });
}
