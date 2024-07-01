import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { createInstruction } from "../instructions/createInstruction";
import { Numberu64, Numberu32 } from "../int";
import { getNameOwner } from "../deprecated/utils";
import { NAME_PROGRAM_ID } from "../constants";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";

/**
 * Creates a name account with the given rent budget, allocated space, owner and class.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the new account
 * @param space The space in bytes allocated to the account
 * @param payerKey The allocation cost payer
 * @param nameOwner The pubkey to be set as owner of the new name account
 * @param lamports The budget to be set for the name account. If not specified, it'll be the minimum for rent exemption
 * @param nameClass The class of this new name
 * @param parentName The parent name of the new name. If specified its owner needs to sign
 * @returns
 */
export async function createNameRegistry(
  connection: Connection,
  name: string,
  space: number,
  payerKey: PublicKey,
  nameOwner: PublicKey,
  lamports?: number,
  nameClass?: PublicKey,
  parentName?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = getHashedNameSync(name);
  const nameAccountKey = getNameAccountKeySync(
    hashed_name,
    nameClass,
    parentName,
  );

  const balance = lamports
    ? lamports
    : await connection.getMinimumBalanceForRentExemption(space);

  let nameParentOwner: PublicKey | undefined;
  if (parentName) {
    const { registry: parentAccount } = await getNameOwner(
      connection,
      parentName,
    );
    nameParentOwner = parentAccount.owner;
  }

  const createNameInstr = createInstruction(
    NAME_PROGRAM_ID,
    SystemProgram.programId,
    nameAccountKey,
    nameOwner,
    payerKey,
    hashed_name,
    new Numberu64(balance),
    new Numberu32(space),
    nameClass,
    parentName,
    nameParentOwner,
  );

  return createNameInstr;
}
