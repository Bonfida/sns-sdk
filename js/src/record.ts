import { RECORD_V1_SIZE, Record, RecordVersion } from "./types/record";
import { Connection, PublicKey } from "@solana/web3.js";
import { getDomainKeySync } from "./utils";
import { NameRegistryState } from "./state";
import { Buffer } from "buffer";
import { encode as bs58Encode } from "bs58";
import {
  isValid as isValidIp,
  fromByteArray as ipFromByteArray,
  parse as parseIp,
} from "ipaddr.js";
import { encode as encodePunycode, decode as decodePunnyCode } from "punycode";
import { check } from "./utils";
import { ErrorType, SNSError } from "./error";
import { ed25519 } from "@noble/curves/ed25519";
import { bech32 } from "@scure/base";

const trimNullPaddingIdx = (buffer: Buffer): number => {
  const arr = Array.from(buffer);
  const lastNonNull =
    arr.length - 1 - arr.reverse().findIndex((byte) => byte !== 0);
  return lastNonNull + 1;
};

/**
 * This function can be used to verify the validity of a SOL record
 * @param record The record data to verify
 * @param signedRecord The signed data
 * @param pubkey The public key of the signer
 * @returns
 */
export const checkSolRecord = (
  record: Uint8Array,
  signedRecord: Uint8Array,
  pubkey: PublicKey,
) => {
  return ed25519.verify(signedRecord, record, pubkey.toBytes());
};

/**
 * This function can be used to derive a record key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns
 */
export const getRecordKeySync = (domain: string, record: Record) => {
  const { pubkey } = getDomainKeySync(record + "." + domain, RecordVersion.V1);
  return pubkey;
};

// Overload signature for the case where deserialize is true.
export async function getRecord(
  connection: Connection,
  domain: string,
  record: Record,
  deserialize: true,
): Promise<string | undefined>;

// Overload signature for the case where deserialize is false or undefined.
export async function getRecord(
  connection: Connection,
  domain: string,
  record: Record,
  deserialize?: false,
): Promise<NameRegistryState | undefined>;

/**
 * This function can be used to retrieve a specified record for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export async function getRecord(
  connection: Connection,
  domain: string,
  record: Record,
  deserialize?: boolean,
) {
  const pubkey = getRecordKeySync(domain, record);
  let { registry } = await NameRegistryState.retrieve(connection, pubkey);

  if (!registry.data) {
    throw new SNSError(ErrorType.NoRecordData);
  }

  if (deserialize) {
    return deserializeRecord(registry, record, pubkey);
  }
  const recordSize = RECORD_V1_SIZE.get(record);
  registry.data = registry.data.slice(0, recordSize);

  return registry;
}

// Overload signature for the case where deserialize is true.
export async function getRecords(
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize: true,
): Promise<string[]>;

// Overload signature for the case where deserialize is false or undefined.
export async function getRecords(
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize?: false,
): Promise<NameRegistryState[]>;

export async function getRecords(
  connection: Connection,
  domain: string,
  records: Record[],
  deserialize?: boolean,
) {
  const pubkeys = records.map((record) => getRecordKeySync(domain, record));
  const registries = await NameRegistryState.retrieveBatch(connection, pubkeys);

  if (deserialize) {
    return registries.map((e, idx) => {
      if (!e) return undefined;
      return deserializeRecord(
        e,
        records[idx],
        getRecordKeySync(domain, records[idx]),
      );
    });
  }
  return registries;
}

/**
 * This function can be used to retrieve the IPFS record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getIpfsRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.IPFS, true);
};

/**
 * This function can be used to retrieve the Arweave record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getArweaveRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.ARWV, true);
};

/**
 * This function can be used to retrieve the ETH record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getEthRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.ETH, true);
};

/**
 * This function can be used to retrieve the BTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBtcRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.BTC, true);
};

/**
 * This function can be used to retrieve the LTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getLtcRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.LTC, true);
};

/**
 * This function can be used to retrieve the DOGE record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getDogeRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.DOGE, true);
};

/**
 * This function can be used to retrieve the email record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getEmailRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Email, true);
};

/**
 * This function can be used to retrieve the URL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getUrlRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.Url, true);
};

/**
 * This function can be used to retrieve the Discord record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getDiscordRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Discord, true);
};

/**
 * This function can be used to retrieve the Github record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getGithubRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Github, true);
};

/**
 * This function can be used to retrieve the Reddit record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getRedditRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Reddit, true);
};

/**
 * This function can be used to retrieve the Twitter record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getTwitterRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Twitter, true);
};

/**
 * This function can be used to retrieve the Telegram record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getTelegramRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Telegram, true);
};

/**
 * This function can be used to retrieve the pic record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getPicRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.Pic, true);
};

/**
 * This function can be used to retrieve the SHDW record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getShdwRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.SHDW, true);
};

/**
 * This function can be used to retrieve the SOL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getSolRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.SOL);
};

/**
 * This function can be used to retrieve the POINT record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getPointRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.POINT, true);
};

/**
 * This function can be used to retrieve the BSC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBscRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.BSC, true);
};

/**
 * This function can be used to retrieve the Injective record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getInjectiveRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Injective, true);
};

/**
 * This function can be used to retrieve the Backpack record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBackpackRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Backpack, true);
};

/**

 * This function can be used to deserialize the content of a record. If the content is invalid it will throw an error
 * This function can be used to retrieve the Background record (V1) of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBackgroundRecord = async (
  connection: Connection,
  domain: string,
) => {
  return await getRecord(connection, domain, Record.Background, true);
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
    throw new SNSError(ErrorType.InvalidRecordData);
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
  throw new SNSError(ErrorType.InvalidRecordData);
};

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
    throw new SNSError(
      ErrorType.UnsupportedRecord,
      "Use `serializeSolRecord` for SOL record",
    );
  } else if (record === Record.ETH || record === Record.BSC) {
    check(str.slice(0, 2) === "0x", ErrorType.InvalidEvmAddress);
    return Buffer.from(str.slice(2), "hex");
  } else if (record === Record.Injective) {
    const decoded = bech32.decodeToBytes(str);
    check(decoded.prefix === "inj", ErrorType.InvalidInjectiveAddress);
    check(decoded.bytes.length === 20, ErrorType.InvalidInjectiveAddress);
    return Buffer.from(decoded.bytes);
  } else if (record === Record.A) {
    const array = parseIp(str).toByteArray();
    check(array.length === 4, ErrorType.InvalidARecord);
    return Buffer.from(array);
  } else if (record === Record.AAAA) {
    const array = parseIp(str).toByteArray();
    check(array.length === 16, ErrorType.InvalidAAAARecord);
    return Buffer.from(array);
  } else if (record === Record.Background) {
    return new PublicKey(str).toBuffer();
  }

  throw new SNSError(ErrorType.InvalidRecordInput);
};

/**
 * This function can be used to build the content of a SOL record
 * @param content The public key being stored in the SOL record
 * @param recordKey The record public key
 * @param signer The signer of the record i.e the domain owner
 * @param signature The signature of the record's content
 * @returns
 */
export const serializeSolRecord = (
  content: PublicKey,
  recordKey: PublicKey,
  signer: PublicKey,
  signature: Uint8Array,
): Buffer => {
  const expected = Buffer.concat([content.toBuffer(), recordKey.toBuffer()]);
  const encodedMessage = new TextEncoder().encode(expected.toString("hex"));
  const valid = checkSolRecord(encodedMessage, signature, signer);
  check(valid, ErrorType.InvalidSignature);

  return Buffer.concat([content.toBuffer(), signature]);
};
