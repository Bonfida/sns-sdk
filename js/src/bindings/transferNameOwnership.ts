import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { transferInstruction } from "../instructions/transferInstruction";
import { NameRegistryState } from "../state";
import { NAME_PROGRAM_ID } from "../constants";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

/**
 * Change the owner of a given name account.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name account
 * @param newOwner The new owner to be set
 * @param nameClass The class of this name, if it exsists
 * @param nameParent The parent name of this name, if it exists
 * @param parentOwner Parent name owner
 * @returns
 */
export async function transferNameOwnership(
  connection: Connection,
  name: string,
  newOwner: PublicKey,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
  parentOwner?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = getHashedNameSync(name);
  const nameAccountKey = getNameAccountKeySync(
    hashed_name,
    nameClass,
    nameParent,
  );

  let curentNameOwner: PublicKey;
  if (nameClass) {
    curentNameOwner = nameClass;
  } else {
    curentNameOwner = (
      await NameRegistryState.retrieve(connection, nameAccountKey)
    ).registry.owner;
  }

  const transferInstr = transferInstruction(
    NAME_PROGRAM_ID,
    nameAccountKey,
    newOwner,
    curentNameOwner,
    nameClass,
    nameParent,
    parentOwner,
  );

  return transferInstr;
}
