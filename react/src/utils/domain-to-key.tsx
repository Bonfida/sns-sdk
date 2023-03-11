import { getDomainKeySync } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";

export const toKey = (domain: string | PublicKey): PublicKey => {
  return typeof domain === "string" ? getDomainKeySync(domain).pubkey : domain;
};
