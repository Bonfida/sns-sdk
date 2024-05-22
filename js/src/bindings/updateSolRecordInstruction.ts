import { Connection, PublicKey } from "@solana/web3.js";
import { deleteInstruction } from "../instructions/deleteInstruction";
import { updateInstruction } from "../instructions/updateInstruction";
import { Numberu32 } from "../int";
import { NAME_PROGRAM_ID } from "../constants";
import { check } from "../utils/check";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { serializeSolRecord } from "../record/serializeSolRecord";
import { Record, RecordVersion } from "../types/record";
import { AccountDoesNotExistError } from "../error";

import { createSolRecordInstruction } from "./createSolRecordInstruction";

export const updateSolRecordInstruction = async (
  connection: Connection,
  domain: string,
  content: PublicKey,
  signer: PublicKey,
  signature: Uint8Array,
  payer: PublicKey,
) => {
  const { pubkey } = getDomainKeySync(
    `${Record.SOL}.${domain}`,
    RecordVersion.V1,
  );

  const info = await connection.getAccountInfo(pubkey);
  check(
    !!info?.data,
    new AccountDoesNotExistError("The record account does not exist"),
  );

  if (info?.data.length !== 96) {
    return [
      deleteInstruction(NAME_PROGRAM_ID, pubkey, payer, signer),
      await createSolRecordInstruction(
        connection,
        domain,
        content,
        signer,
        signature,
        payer,
      ),
    ];
  }

  const serialized = serializeSolRecord(content, pubkey, signer, signature);
  const ix = updateInstruction(
    NAME_PROGRAM_ID,
    pubkey,
    new Numberu32(0),
    serialized,
    signer,
  );

  return [ix];
};
