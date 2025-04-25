import { Address } from "@solana/kit";

import { Record } from "../types/record";

/**
 * A map that associates each record type with a public key, known as guardians.
 */
export const GUARDIANS = new Map<Record, Address>([
  [Record.CNAME, "ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3" as Address],
  [Record.Url, "ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3" as Address],
]);

/**
 * Set of records that utilize secp256k1 for verification purposes
 */
export const ETH_ROA_RECORDS = new Set<Record>([
  Record.BASE,
  Record.BSC,
  Record.ETH,
  Record.Injective,
]);

/**
 * Set of records which correspond to eth addresses with the prefix 0x
 */
export const EVM_RECORDS = new Set<Record>([
  Record.BASE,
  Record.BSC,
  Record.ETH,
]);

/**
 * Set of records that are UTF-8 encoded strings
 */
export const UTF8_ENCODED_RECORDS = new Set<Record>([
  Record.ARWV,
  Record.Backpack,
  Record.BTC,
  Record.CNAME,
  Record.Discord,
  Record.DOGE,
  Record.Email,
  Record.Github,
  Record.IPFS,
  Record.IPNS,
  Record.LTC,
  Record.Pic,
  Record.POINT,
  Record.Reddit,
  Record.SHDW,
  Record.Telegram,
  Record.Twitter,
  Record.TXT,
  Record.Url,
]);

/**
 * Set of records that are self signed i.e signed by the public key contained
 * in the record itself.
 */
export const SELF_SIGNED_RECORDS = new Set<Record>([
  Record.BASE,
  Record.BSC,
  Record.ETH,
  Record.Injective,
  Record.SOL,
]);
