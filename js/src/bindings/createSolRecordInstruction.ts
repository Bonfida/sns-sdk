import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { createInstruction } from "../instructions/createInstruction";
import { NameRegistryState } from "../state";
import { Numberu64, Numberu32 } from "../int";
import { NAME_PROGRAM_ID } from "../constants";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { serializeSolRecord } from "../record/serializeSolRecord";
import { Record, RecordVersion } from "../types/record";

/**
 * This function can be used to create a SOL record (V1)
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param content The content of the SOL record i.e the public key to store as destination of the domain
 * @param signer The signer of the SOL record i.e the owner of the domain
 * @param signature The signature of the record
 * @param payer The fee payer of the transaction
 * @returns
 */
export const createSolRecordInstruction = async (
  connection: Connection,
  domain: string,
  content: PublicKey,
  signer: PublicKey,
  signature: Uint8Array,
  payer: PublicKey,
) => {
  const { pubkey, hashed, parent } = getDomainKeySync(
    `${Record.SOL}.${domain}`,
    RecordVersion.V1,
  );
  const serialized = serializeSolRecord(content, pubkey, signer, signature);
  const space = serialized.length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
  );

  const ix = createInstruction(
    NAME_PROGRAM_ID,
    SystemProgram.programId,
    pubkey,
    signer,
    payer,
    hashed,
    new Numberu64(lamports),
    new Numberu32(space),
    undefined,
    parent,
    signer,
  );

  return ix;
};
