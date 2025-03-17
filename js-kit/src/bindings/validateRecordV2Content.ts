import { SNS_RECORDS_ID, validateSolanaSignature } from "@bonfida/sns-records";
import { PublicKey } from "@solana/web3.js";

import { NAME_PROGRAM_ID } from "../constants";
import { InvalidParrentError } from "../error";
import { Record, RecordVersion } from "../types/record";
import { getDomainKeySync } from "../utils/getDomainKeySync";

export const validateRecordV2Content = (
  staleness: boolean,
  domain: string,
  record: Record,
  owner: Address,
  payer: Address,
  verifier: Address
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new InvalidParrentError("Parent could not be found");
  }

  const ix = validateSolanaSignature(
    payer,
    pubkey,
    parent,
    owner,
    verifier,
    NAME_PROGRAM_ID,
    staleness,
    SNS_RECORDS_ID
  );
  return ix;
};
