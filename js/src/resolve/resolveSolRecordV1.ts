import { Connection, PublicKey } from "@solana/web3.js";
import { getRecordKeySync } from "../record/getRecordKeySync";
import { getSolRecord } from "../record/helpers/getSolRecord";
import { checkSolRecord } from "../record/checkSolRecord";
import { Record } from "../types/record";
import { Buffer } from "buffer";
import { InvalidSignatureError, NoRecordDataError } from "../error";

export const resolveSolRecordV1 = async (
  connection: Connection,
  owner: PublicKey,
  domain: string,
) => {
  const recordKey = getRecordKeySync(domain, Record.SOL);
  const solRecord = await getSolRecord(connection, domain);

  if (!solRecord?.data) {
    throw new NoRecordDataError("The SOL record V1 data is empty");
  }

  const encoder = new TextEncoder();
  const expectedBuffer = Buffer.concat([
    solRecord.data.slice(0, 32),
    recordKey.toBuffer(),
  ]);
  const expected = encoder.encode(expectedBuffer.toString("hex"));
  const valid = checkSolRecord(expected, solRecord.data.slice(32), owner);

  if (!valid) {
    throw new InvalidSignatureError("The SOL record V1 signature is invalid");
  }

  return new PublicKey(solRecord.data.slice(0, 32));
};
