import { Buffer } from "buffer";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { updateInstruction } from "../instructions/updateInstruction";
import { NameRegistryState } from "../state";
import { Numberu32 } from "../int";
import { NAME_PROGRAM_ID } from "../constants";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

/**
 * Overwrite the data of the given name registry.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name registry to update
 * @param offset The offset to which the data should be written into the registry
 * @param input_data The data to be written
 * @param nameClass The class of this name, if it exsists
 * @param nameParent The parent name of this name, if it exists
 */
export async function updateNameRegistryData(
  connection: Connection,
  name: string,
  offset: number,
  input_data: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = getHashedNameSync(name);
  const nameAccountKey = getNameAccountKeySync(
    hashed_name,
    nameClass,
    nameParent,
  );

  let signer: PublicKey;
  if (nameClass) {
    signer = nameClass;
  } else {
    signer = (await NameRegistryState.retrieve(connection, nameAccountKey))
      .registry.owner;
  }

  const updateInstr = updateInstruction(
    NAME_PROGRAM_ID,
    nameAccountKey,
    new Numberu32(offset),
    input_data,
    signer,
  );

  return updateInstr;
}
