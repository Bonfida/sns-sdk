import { RECORD_V1_SIZE, Record } from "./types/record";
import { Connection, PublicKey } from "@solana/web3.js";
import { getDomainKeySync } from "./utils";
import { NameRegistryState } from "./state";
import { Buffer } from "buffer";
import { decode, encode } from "bech32-buffer";
import { checkSolRecord } from "./resolve";
import base58 from "bs58";

const trimNullPaddingIdx = (buffer: Buffer): number => {
  const arr = Array.from(buffer);
  const lastNonNull =
    arr.length - 1 - arr.reverse().findIndex((byte) => byte !== 0);
  return lastNonNull + 1;
};

/**
 * This function can be used to derive a record key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns
 */
export const getRecordKeySync = (domain: string, record: Record) => {
  const { pubkey } = getDomainKeySync(record + "." + domain, true);
  return pubkey;
};

/**
 * This function can be used to retrieve a specified record for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export const getRecord = async (
  connection: Connection,
  domain: string,
  record: Record
) => {
  const pubkey = getRecordKeySync(domain, record);
  let { registry } = await NameRegistryState.retrieve(connection, pubkey);

  if (!registry.data) {
    throw new Error("No record data");
  }

  const recordSize = RECORD_V1_SIZE.get(record);

  // Remove trailling 0s
  const idx = !!recordSize ? recordSize : trimNullPaddingIdx(registry.data);
  registry.data = registry.data?.slice(0, idx);

  return registry;
};

export const getRecords = async (
  connection: Connection,
  domain: string,
  records: Record[]
) => {
  const pubkeys = records.map((record) => getRecordKeySync(domain, record));
  let registries = await NameRegistryState.retrieveBatch(connection, pubkeys);

  return registries.map((e, i) => {
    // Remove trailling 0s
    if (!e || !e.data) return undefined;
    const recordSize = RECORD_V1_SIZE.get(records[i]);
    const idx = !!recordSize ? recordSize : trimNullPaddingIdx(e.data);
    e.data = e?.data?.slice(0, idx);
    return e;
  });
};

/**
 * This function can be used to retrieve the IPFS record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getIpfsRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.IPFS);
};

/**
 * This function can be used to retrieve the Arweave record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getArweaveRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.ARWV);
};

/**
 * This function can be used to retrieve the ETH record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getEthRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.ETH);
};

/**
 * This function can be used to retrieve the BTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBtcRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.BTC);
};

/**
 * This function can be used to retrieve the LTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getLtcRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.LTC);
};

/**
 * This function can be used to retrieve the DOGE record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getDogeRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.DOGE);
};

/**
 * This function can be used to retrieve the email record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getEmailRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Email);
};

/**
 * This function can be used to retrieve the URL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getUrlRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.Url);
};

/**
 * This function can be used to retrieve the Discord record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getDiscordRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Discord);
};

/**
 * This function can be used to retrieve the Github record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getGithubRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Github);
};

/**
 * This function can be used to retrieve the Reddit record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getRedditRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Reddit);
};

/**
 * This function can be used to retrieve the Twitter record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getTwitterRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Twitter);
};

/**
 * This function can be used to retrieve the Telegram record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getTelegramRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Telegram);
};

/**
 * This function can be used to retrieve the pic record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getPicRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.Pic);
};

/**
 * This function can be used to retrieve the SHDW record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getShdwRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.SHDW);
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
  domain: string
) => {
  return await getRecord(connection, domain, Record.POINT);
};

/**
 * This function can be used to retrieve the BSC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBscRecord = async (connection: Connection, domain: string) => {
  return await getRecord(connection, domain, Record.BSC);
};

/**
 * This function can be used to retrieve the Injective record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getInjectiveRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Injective);
};

/**
 * This function can be used to retrieve the Backpack record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBackpackRecord = async (
  connection: Connection,
  domain: string
) => {
  return await getRecord(connection, domain, Record.Backpack);
};

export const deserializeRecord = (
  registry: NameRegistryState,
  record: Record,
  recordKey: PublicKey
): string | undefined => {
  const buffer = registry.data;
  if (!buffer) return undefined;

  const size = RECORD_V1_SIZE.get(record);
  const idx = trimNullPaddingIdx(buffer);

  if (!size) {
    return buffer.slice(0, idx).toString("utf-8");
  }

  // Old record UTF-8 encoded
  if (size && idx !== size) {
    const address = buffer.slice(0, idx).toString("utf-8");
    if (record === Record.Injective) {
      const decoded = decode(address);
      if (decoded.prefix === "inj" && decoded.data.length === 20) {
        return address;
      }
    } else if (record === Record.BSC || record === Record.ETH) {
      const prefix = address.slice(0, 2);
      const hex = address.slice(2);
      if (prefix === "0x" && Buffer.from(hex, "hex").length === 20) {
        return address;
      }
    }
    throw new Error("Invalid record content");
  }

  if (record === Record.SOL) {
    const encoder = new TextEncoder();
    const expectedBuffer = Buffer.concat([
      buffer.slice(0, 32),
      recordKey.toBuffer(),
    ]);
    const expected = encoder.encode(expectedBuffer.toString("hex"));
    const valid = checkSolRecord(expected, buffer.slice(32), registry.owner);
    if (valid) {
      return base58.encode(buffer.slice(0, 32));
    }
  } else if (record === Record.ETH || record === Record.BSC) {
    return "0x" + buffer.toString("hex");
  } else if (record === Record.Injective) {
    return encode("inj", buffer);
  }

  throw new Error("Invalid record content");
};
