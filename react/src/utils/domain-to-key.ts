import { getDomainKeySync } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";

export const toDomainKey = (
  domain: string | PublicKey | undefined | null,
): PublicKey | undefined => {
  if (!domain) return undefined;
  return typeof domain === "string" ? getDomainKeySync(domain).pubkey : domain;
};
