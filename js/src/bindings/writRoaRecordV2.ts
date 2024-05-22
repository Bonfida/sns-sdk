import { PublicKey } from "@solana/web3.js";
import { NAME_PROGRAM_ID } from "../constants";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { Record, RecordVersion } from "../types/record";
import { SNS_RECORDS_ID, writeRoa } from "@bonfida/sns-records";
import { InvalidParrentError } from "../error";

export const writRoaRecordV2 = (
  domain: string,
  record: Record,
  owner: PublicKey,
  payer: PublicKey,
  roaId: PublicKey,
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
  const ix = writeRoa(
    payer,
    NAME_PROGRAM_ID,
    pubkey,
    parent,
    owner,
    roaId,
    SNS_RECORDS_ID,
  );
  return ix;
};
