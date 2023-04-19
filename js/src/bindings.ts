import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  createInstruction,
  deleteInstruction,
  transferInstruction,
  updateInstruction,
  createReverseInstruction,
  createInstructionV3,
} from "./instructions";
import { NameRegistryState } from "./state";
import { Numberu64, Numberu32 } from "./int";
import {
  getHashedName,
  getNameAccountKey,
  getNameOwner,
} from "./deprecated/utils";
import {
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  REGISTER_PROGRAM_ID,
  REFERRERS,
  USDC_MINT,
  TOKENS_SYM_MINT,
  PYTH_MAPPING_ACC,
  VAULT_OWNER,
} from "./constants";
import {
  getPythProgramKeyForCluster,
  PythHttpClient,
} from "@pythnetwork/client";
import { getHashedNameSync, getNameAccountKeySync } from "./utils";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

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
  parentName?: PublicKey
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
  const nameAccountKey = await getNameAccountKey(
    hashed_name,
    nameClass,
    parentName
  );

  const balance = lamports
    ? lamports
    : await connection.getMinimumBalanceForRentExemption(space);

  let nameParentOwner: PublicKey | undefined;
  if (parentName) {
    const { registry: parentAccount } = await getNameOwner(
      connection,
      parentName
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
    //@ts-ignore
    new Numberu64(balance),
    //@ts-ignore
    new Numberu32(space),
    nameClass,
    parentName,
    nameParentOwner
  );

  return createNameInstr;
}

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
  nameParent?: PublicKey
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
  const nameAccountKey = await getNameAccountKey(
    hashed_name,
    nameClass,
    nameParent
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
    //@ts-ignore
    new Numberu32(offset),
    input_data,
    signer
  );

  return updateInstr;
}

/**
 * Change the owner of a given name account.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name account
 * @param newOwner The new owner to be set
 * @param curentNameOwner the current name Owner
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
  parentOwner?: PublicKey
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
  const nameAccountKey = await getNameAccountKey(
    hashed_name,
    nameClass,
    nameParent
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
    parentOwner
  );

  return transferInstr;
}

/**
 * Delete the name account and transfer the rent to the target.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name account
 * @param refundTargetKey The refund destination address
 * @param nameClass The class of this name, if it exsists
 * @param nameParent The parent name of this name, if it exists
 * @returns
 */
export async function deleteNameRegistry(
  connection: Connection,
  name: string,
  refundTargetKey: PublicKey,
  nameClass?: PublicKey,
  nameParent?: PublicKey
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
  const nameAccountKey = await getNameAccountKey(
    hashed_name,
    nameClass,
    nameParent
  );

  let nameOwner: PublicKey;
  if (nameClass) {
    nameOwner = nameClass;
  } else {
    nameOwner = (await NameRegistryState.retrieve(connection, nameAccountKey))
      .registry.owner;
  }

  const changeAuthoritiesInstr = deleteInstruction(
    NAME_PROGRAM_ID,
    nameAccountKey,
    refundTargetKey,
    nameOwner
  );

  return changeAuthoritiesInstr;
}

/**
 * This function can be used to register a .sol domain
 * @param connection The Solana RPC connection object
 * @param name The domain name to register e.g bonfida if you want to register bonfida.sol
 * @param space The domain name account size (max 10kB)
 * @param buyer The public key of the buyer
 * @param buyerTokenAccount The buyer token account (USDC)
 * @param mint Optional mint used to purchase the domain, defaults to USDC
 * @param referrerKey Optional referrer key
 * @returns
 */
export const registerDomainName = async (
  connection: Connection,
  name: string,
  space: number,
  buyer: PublicKey,
  buyerTokenAccount: PublicKey,
  mint = USDC_MINT,
  referrerKey?: PublicKey
) => {
  const [cs] = PublicKey.findProgramAddressSync(
    [REGISTER_PROGRAM_ID.toBuffer()],
    REGISTER_PROGRAM_ID
  );

  const hashed = getHashedNameSync(name);
  const nameAccount = getNameAccountKeySync(
    hashed,
    undefined,
    ROOT_DOMAIN_ACCOUNT
  );

  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(hashedReverseLookup, cs);

  const [derived_state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID
  );

  const refIdx = REFERRERS.findIndex((e) => referrerKey?.equals(e));
  let refTokenAccount: PublicKey | undefined = undefined;

  const ixs: TransactionInstruction[] = [];

  if (refIdx !== -1 && !!referrerKey) {
    refTokenAccount = getAssociatedTokenAddressSync(mint, referrerKey, true);
    const acc = await connection.getAccountInfo(refTokenAccount);
    if (!acc?.data) {
      const ix = createAssociatedTokenAccountInstruction(
        buyer,
        refTokenAccount,
        referrerKey,
        mint
      );
      ixs.push(ix);
    }
  }

  const pythConnection = new PythHttpClient(
    connection,
    getPythProgramKeyForCluster("mainnet-beta")
  );
  const data = await pythConnection.getData();

  const symbol = TOKENS_SYM_MINT.get(mint.toBase58());

  if (!symbol) {
    throw new Error("Symbol not found");
  }

  const priceData = data.productPrice.get("Crypto." + symbol + "/USD")!;
  const productData = data.productFromSymbol.get("Crypto." + symbol + "/USD")!;

  const vault = getAssociatedTokenAddressSync(mint, VAULT_OWNER);

  const ix = new createInstructionV3({
    name,
    space,
    referrerIdxOpt: refIdx != -1 ? refIdx : null,
  }).getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    nameAccount,
    reverseLookupAccount,
    SystemProgram.programId,
    cs,
    buyer,
    buyerTokenAccount,
    PYTH_MAPPING_ACC,
    priceData.productAccountKey,
    new PublicKey(productData.price_account),
    vault,
    TOKEN_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    derived_state,
    refTokenAccount
  );
  ixs.push(ix);

  return [[], ixs];
};

/**
 *
 * @param nameAccount The name account to create the reverse account for
 * @param name The name of the domain
 * @param feePayer The fee payer of the transaction
 * @param parentName The parent name account
 * @param parentNameOwner The parent name owner
 * @returns
 */
export const createReverseName = async (
  nameAccount: PublicKey,
  name: string,
  feePayer: PublicKey,
  parentName?: PublicKey,
  parentNameOwner?: PublicKey
) => {
  let [centralState] = await PublicKey.findProgramAddress(
    [REGISTER_PROGRAM_ID.toBuffer()],
    REGISTER_PROGRAM_ID
  );

  let hashedReverseLookup = await getHashedName(nameAccount.toBase58());
  let reverseLookupAccount = await getNameAccountKey(
    hashedReverseLookup,
    centralState,
    parentName
  );

  let initCentralStateInstruction = new createReverseInstruction({
    name,
  }).getInstruction(
    REGISTER_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    reverseLookupAccount,
    centralState,
    feePayer,
    parentName,
    parentNameOwner
  );

  let instructions = [initCentralStateInstruction];

  return [[], instructions];
};
