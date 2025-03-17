import {
  SNS_RECORDS_ID,
  Validation,
  validateEthSignature,
} from "@bonfida/sns-records";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

import { NAME_PROGRAM_ID } from "../constants";
import { InvalidParrentError } from "../error";
import { Record, RecordVersion } from "../types/record";
import { getDomainKeySync } from "../utils/getDomainKeySync";

export const ethValidateRecordV2Content = (
  domain: string,
  record: Record,
  owner: Address,
  payer: Address,
  signature: Buffer,
  expectedPubkey: Buffer
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

  const ix = validateEthSignature(
    payer,
    pubkey,
    parent,
    owner,
    NAME_PROGRAM_ID,
    Validation.Ethereum,
    signature,
    expectedPubkey,
    SNS_RECORDS_ID
  );
  return ix;
};
