import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { NAME_PROGRAM_ID } from "../constants";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { Record, RecordVersion } from "../types/record";
import {
  SNS_RECORDS_ID,
  validateEthSignature,
  Validation,
} from "@bonfida/sns-records";
import { InvalidParrentError } from "../error";

export const ethValidateRecordV2Content = (
  domain: string,
  record: Record,
  owner: PublicKey,
  payer: PublicKey,
  signature: Buffer,
  expectedPubkey: Buffer,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
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
    SNS_RECORDS_ID,
  );
  return ix;
};
