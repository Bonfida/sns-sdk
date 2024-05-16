/**
 * List of SNS Records
 */
export enum Record {
  IPFS = "IPFS",
  ARWV = "ARWV",
  SOL = "SOL",
  ETH = "ETH",
  BTC = "BTC",
  LTC = "LTC",
  DOGE = "DOGE",
  Email = "email",
  Url = "url",
  Discord = "discord",
  Github = "github",
  Reddit = "reddit",
  Twitter = "twitter",
  Telegram = "telegram",
  Pic = "pic",
  SHDW = "SHDW",
  POINT = "POINT",
  BSC = "BSC",
  Injective = "INJ",
  Backpack = "backpack",
  A = "A",
  AAAA = "AAAA",
  CNAME = "CNAME",
  TXT = "TXT",
  Background = "background",
  BASE = "BASE",
}

export const RECORD_V1_SIZE: Map<Record, number> = new Map([
  [Record.SOL, 96],
  [Record.ETH, 20],
  [Record.BSC, 20],
  [Record.Injective, 20],
  [Record.A, 4],
  [Record.AAAA, 16],
  [Record.Background, 32],
]);

export enum RecordVersion {
  V1 = 1,
  V2 = 2,
}
