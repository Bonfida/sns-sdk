import { Record } from "../types/record";
import { PublicKey } from "@solana/web3.js";

/**
 * A map that associates each record type with a public key, known as guardians.
 */
export const GUARDIANS = new Map<Record, PublicKey>([
  [Record.Url, new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3")],
  [Record.CNAME, new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3")],
]);

/**
 * Set of records that utilize secp256k1 for verification purposes
 */
export const ETH_ROA_RECORDS = new Set<Record>([
  Record.ETH,
  Record.Injective,
  Record.BSC,
  Record.BASE,
]);

export const EVM_RECORDS = new Set<Record>([
  Record.ETH,
  Record.BSC,
  Record.BASE,
]);

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
  Record.IPNS,
  Record.Location,
  Record.Bio,
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
