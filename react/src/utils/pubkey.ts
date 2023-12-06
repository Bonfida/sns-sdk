import { PublicKey } from "@solana/web3.js";

export const toKey = (
  domain: string | PublicKey | undefined | null,
): PublicKey | undefined => {
  if (!domain) return undefined;
  return typeof domain === "string" ? new PublicKey(domain) : domain;
};
