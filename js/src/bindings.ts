import { Buffer } from "buffer";
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
import {
  check,
  getDomainKeySync,
  getHashedNameSync,
  getNameAccountKeySync,
  getReverseKeySync,
} from "./utils";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { ErrorType, SNSError } from "./error";
import { serializeRecord, serializeSolRecord } from "./record";
import { Record } from "./types/record";

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
    throw new SNSError(
      ErrorType.SymbolNotFound,
      `No symbol found for mint ${mint.toBase58()}`
    );
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

/**
 * This function can be used to create a subdomain
 * @param connection The Solana RPC connection object
 * @param subdomain The subdomain to create with or without .sol e.g something.bonfida.sol or something.bonfida
 * @param owner The owner of the parent domain creating the subdomain
 * @param space The space to allocate to the subdomain (defaults to 2kb)
 */
export const createSubdomain = async (
  connection: Connection,
  subdomain: string,
  owner: PublicKey,
  space = 2_000
) => {
  const ixs: TransactionInstruction[] = [];
  const sub = subdomain.split(".")[0];
  if (!sub) {
    throw new SNSError(ErrorType.InvalidSubdomain);
  }

  const { parent, pubkey } = getDomainKeySync(subdomain);

  // Space allocated to the subdomains
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN
  );

  const ix_create = await createNameRegistry(
    connection,
    "\0".concat(sub),
    space, // Hardcode space to 2kB
    owner,
    owner,
    lamports,
    undefined,
    parent
  );
  ixs.push(ix_create);

  // Create the reverse name
  const reverseKey = getReverseKeySync(subdomain, true);
  const info = await connection.getAccountInfo(reverseKey);
  if (!info?.data) {
    const [, ix_reverse] = await createReverseName(
      pubkey,
      "\0".concat(sub),
      owner,
      parent,
      owner
    );
    ixs.push(...ix_reverse);
  }

  return [[], ixs];
};

/**
 * This function can be used be create a record, it handles the serialization of the record data
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
  payer: PublicKey
) => {
  check(record !== Record.SOL, ErrorType.UnsupportedRecord);
  const { pubkey, hashed, parent } = getDomainKeySync(
    `${record}.${domain}`,
    true
  );

  const serialized = serializeRecord(data, record);
  const space = serialized.length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN
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
    owner
  );

  return ix;
};

export const updateRecordInstruction = async (
  connection: Connection,
  domain: string,
  record: Record,
  data: string,
  owner: PublicKey,
  payer: PublicKey
) => {
  check(record !== Record.SOL, ErrorType.UnsupportedRecord);
  const { pubkey } = getDomainKeySync(`${record}.${domain}`, true);

  const info = await connection.getAccountInfo(pubkey);
  check(!!info?.data, ErrorType.AccountDoesNotExist);

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
        payer
      ),
    ];
  }

  const ix = updateInstruction(
    NAME_PROGRAM_ID,
    pubkey,
    new Numberu32(0),
    serialized,
    owner
  );

  return [ix];
};

/**
 * This function can be used to create a SOL record
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
  payer: PublicKey
) => {
  const { pubkey, hashed, parent } = getDomainKeySync(
    `${Record.SOL}.${domain}`,
    true
  );
  const serialized = serializeSolRecord(content, pubkey, signer, signature);
  const space = serialized.length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN
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
    signer
  );

  return [ix];
};

export const updateSolRecordInstruction = async (
  connection: Connection,
  domain: string,
  content: PublicKey,
  signer: PublicKey,
  signature: Uint8Array,
  payer: PublicKey
) => {
  const { pubkey } = getDomainKeySync(`${Record.SOL}.${domain}`, true);

  const info = await connection.getAccountInfo(pubkey);
  check(!!info?.data, ErrorType.AccountDoesNotExist);

  if (info?.data.length !== 96) {
    return [
      deleteInstruction(NAME_PROGRAM_ID, pubkey, payer, signer),
      await createSolRecordInstruction(
        connection,
        domain,
        content,
        signer,
        signature,
        payer
      ),
    ];
  }

  const serialized = serializeSolRecord(content, pubkey, signer, signature);
  const ix = updateInstruction(
    NAME_PROGRAM_ID,
    pubkey,
    new Numberu32(0),
    serialized,
    signer
  );

  return [ix];
};
