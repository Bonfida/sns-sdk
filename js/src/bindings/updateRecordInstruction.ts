import { Connection, PublicKey } from "@solana/web3.js";
import { deleteInstruction } from "../instructions/deleteInstruction";
import { updateInstruction } from "../instructions/updateInstruction";
import { Numberu32 } from "../int";
import { NAME_PROGRAM_ID } from "../constants";
import { check } from "../utils/check";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { serializeRecord } from "../record/serializeRecord";
import { Record, RecordVersion } from "../types/record";
import { AccountDoesNotExistError, UnsupportedRecordError } from "../error";
import { createRecordInstruction } from "./createRecordInstruction";

export const updateRecordInstruction = async (
  connection: Connection,
  domain: string,
  record: Record,
  data: string,
  owner: PublicKey,
  payer: PublicKey,
) => {
  check(
    record !== Record.SOL,
    new UnsupportedRecordError(
      "SOL record is not supported for this instruction",
    ),
  );
  const { pubkey } = getDomainKeySync(`${record}.${domain}`, RecordVersion.V1);

  const info = await connection.getAccountInfo(pubkey);
  check(
    !!info?.data,
    new AccountDoesNotExistError("The record account does not exist"),
  );

  const serialized = serializeRecord(data, record);
  if (info?.data.slice(96).length !== serialized.length) {
    // Delete + create until we can realloc accounts
    return [
      deleteInstruction(NAME_PROGRAM_ID, pubkey, payer, owner),
      await createRecordInstruction(
        connection,
        domain,
        record,
        data,
        owner,
        payer,
      ),
    ];
  }

  const ix = updateInstruction(
    NAME_PROGRAM_ID,
    pubkey,
    new Numberu32(0),
    serialized,
    owner,
  );

  return ix;
};
