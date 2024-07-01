import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { createInstruction } from "../instructions/createInstruction";
import { NameRegistryState } from "../state";
import { Numberu64, Numberu32 } from "../int";
import { NAME_PROGRAM_ID } from "../constants";
import { check } from "../utils/check";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { serializeRecord } from "../record/serializeRecord";
import { Record, RecordVersion } from "../types/record";
import { UnsupportedRecordError } from "../error";

/**
 * This function can be used be create a record V1, it handles the serialization of the record data
 * To create a SOL record use `createSolRecordInstruction`
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record enum object
 * @param data The data (as a UTF-8 string) to store in the record account
 * @param owner The owner of the domain
 * @param payer The fee payer of the transaction
 * @returns
 */
export const createRecordInstruction = async (
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
  const { pubkey, hashed, parent } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V1,
  );

  const serialized = serializeRecord(data, record);
  const space = serialized.length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
  );

  const ix = createInstruction(
    NAME_PROGRAM_ID,
    SystemProgram.programId,
    pubkey,
    owner,
    payer,
    hashed,
    new Numberu64(lamports),
    new Numberu32(space),
    undefined,
    parent,
    owner,
  );

  return ix;
};
