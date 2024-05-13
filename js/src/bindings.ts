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
  burnInstruction,
  createWithNftInstruction,
  registerFavoriteInstruction,
  createSplitV2Instruction,
} from "./instructions";
import { NameRegistryState } from "./state";
import { Numberu64, Numberu32 } from "./int";
import { getNameOwner } from "./deprecated/utils";
import {
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  REGISTER_PROGRAM_ID,
  REFERRERS,
  USDC_MINT,
  PYTH_FEEDS,
  PYTH_MAPPING_ACC,
  VAULT_OWNER,
  REVERSE_LOOKUP_CLASS,
  WOLVES_COLLECTION_METADATA,
  METAPLEX_ID,
  PYTH_PULL_FEEDS,
} from "./constants";
import {
  check,
  getDomainKeySync,
  getHashedNameSync,
  getNameAccountKeySync,
  getPythFeedAccountKey,
  getReverseKeySync,
} from "./utils";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import { ErrorType, SNSError } from "./error";
import { serializeRecord, serializeSolRecord } from "./record";
import { Record, RecordVersion } from "./types/record";
import { serializeRecordV2Content } from "./record_v2";
import {
  editRecord,
  allocateAndPostRecord,
  SNS_RECORDS_ID,
  deleteRecord,
  validateSolanaSignature,
  validateEthSignature,
  Validation,
  writeRoa,
} from "@bonfida/sns-records";
import { FavouriteDomain, NAME_OFFERS_ID } from "./favorite-domain";

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
  nameParent?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = getHashedNameSync(name);
  const nameAccountKey = getNameAccountKeySync(
    hashed_name,
    nameClass,
    nameParent,
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
    nameOwner,
  );

  return changeAuthoritiesInstr;
}

/**
 * @deprecated This function is deprecated and will be removed in future releases. Use `registerDomainNameV2` instead.
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
  referrerKey?: PublicKey,
) => {
  // Basic validation
  if (name.includes(".") || name.trim().toLowerCase() !== name) {
    throw new SNSError(ErrorType.InvalidDomain);
  }
  const [cs] = PublicKey.findProgramAddressSync(
    [REGISTER_PROGRAM_ID.toBuffer()],
    REGISTER_PROGRAM_ID,
  );

  const hashed = getHashedNameSync(name);
  const nameAccount = getNameAccountKeySync(
    hashed,
    undefined,
    ROOT_DOMAIN_ACCOUNT,
  );

  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(hashedReverseLookup, cs);

  const [derived_state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID,
  );

  const refIdx = REFERRERS.findIndex((e) => referrerKey?.equals(e));
  let refTokenAccount: PublicKey | undefined = undefined;

  const ixs: TransactionInstruction[] = [];

  if (refIdx !== -1 && !!referrerKey) {
    refTokenAccount = getAssociatedTokenAddressSync(mint, referrerKey, true);
    const acc = await connection.getAccountInfo(refTokenAccount);
    if (!acc?.data) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        buyer,
        refTokenAccount,
        referrerKey,
        mint,
      );
      ixs.push(ix);
    }
  }

  const vault = getAssociatedTokenAddressSync(mint, VAULT_OWNER, true);
  const pythFeed = PYTH_FEEDS.get(mint.toBase58());

  if (!pythFeed) {
    throw new SNSError(ErrorType.PythFeedNotFound);
  }

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
    new PublicKey(pythFeed.product),
    new PublicKey(pythFeed.price),
    vault,
    TOKEN_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    derived_state,
    refTokenAccount,
  );
  ixs.push(ix);

  return [[], ixs];
};

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
export const registerDomainNameV2 = async (
  connection: Connection,
  name: string,
  space: number,
  buyer: PublicKey,
  buyerTokenAccount: PublicKey,
  mint = USDC_MINT,
  referrerKey?: PublicKey,
) => {
  // Basic validation
  if (name.includes(".") || name.trim().toLowerCase() !== name) {
    throw new SNSError(ErrorType.InvalidDomain);
  }
  const [cs] = PublicKey.findProgramAddressSync(
    [REGISTER_PROGRAM_ID.toBuffer()],
    REGISTER_PROGRAM_ID,
  );

  const hashed = getHashedNameSync(name);
  const nameAccount = getNameAccountKeySync(
    hashed,
    undefined,
    ROOT_DOMAIN_ACCOUNT,
  );

  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(hashedReverseLookup, cs);

  const [derived_state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID,
  );

  const refIdx = REFERRERS.findIndex((e) => referrerKey?.equals(e));
  let refTokenAccount: PublicKey | undefined = undefined;

  const ixs: TransactionInstruction[] = [];

  if (refIdx !== -1 && !!referrerKey) {
    refTokenAccount = getAssociatedTokenAddressSync(mint, referrerKey, true);
    const acc = await connection.getAccountInfo(refTokenAccount);
    if (!acc?.data) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        buyer,
        refTokenAccount,
        referrerKey,
        mint,
      );
      ixs.push(ix);
    }
  }

  const vault = getAssociatedTokenAddressSync(mint, VAULT_OWNER, true);
  const pythFeed = PYTH_PULL_FEEDS.get(mint.toBase58());

  if (!pythFeed) {
    throw new SNSError(ErrorType.PythFeedNotFound);
  }

  const [pythFeedAccount] = getPythFeedAccountKey(0, pythFeed);

  const ix = new createSplitV2Instruction({
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
    buyer,
    buyer,
    buyerTokenAccount,
    pythFeedAccount,
    vault,
    TOKEN_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    derived_state,
    refTokenAccount,
  );
  ixs.push(ix);

  return ixs;
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
  parentNameOwner?: PublicKey,
) => {
  let [centralState] = await PublicKey.findProgramAddress(
    [REGISTER_PROGRAM_ID.toBuffer()],
    REGISTER_PROGRAM_ID,
  );

  let hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  let reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    centralState,
    parentName,
  );

  let initCentralStateInstruction = new createReverseInstruction({
    name,
  }).getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    reverseLookupAccount,
    SystemProgram.programId,
    centralState,
    feePayer,
    SYSVAR_RENT_PUBKEY,
    parentName,
    parentNameOwner,
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
 * @param feePayer Optional: Specifies a fee payer different from the parent owner
 */
export const createSubdomain = async (
  connection: Connection,
  subdomain: string,
  owner: PublicKey,
  space = 2_000,
  feePayer?: PublicKey,
) => {
  const ixs: TransactionInstruction[] = [];
  const sub = subdomain.split(".")[0];
  if (!sub) {
    throw new SNSError(ErrorType.InvalidSubdomain);
  }

  const { parent, pubkey } = getDomainKeySync(subdomain);

  // Space allocated to the subdomains
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
  );

  const ix_create = await createNameRegistry(
    connection,
    "\0".concat(sub),
    space, // Hardcode space to 2kB
    feePayer || owner,
    owner,
    lamports,
    undefined,
    parent,
  );
  ixs.push(ix_create);

  // Create the reverse name
  const reverseKey = getReverseKeySync(subdomain, true);
  const info = await connection.getAccountInfo(reverseKey);
  if (!info?.data) {
    const [, ix_reverse] = await createReverseName(
      pubkey,
      "\0".concat(sub),
      feePayer || owner,
      parent,
      owner,
    );
    ixs.push(...ix_reverse);
  }

  return [[], ixs];
};

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
  check(record !== Record.SOL, ErrorType.UnsupportedRecord);
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

/**
 * This function can be used be create a record V2, it handles the serialization of the record data following SNS-IP 1 guidelines
 * @param domain The .sol domain name
 * @param record The record enum object
 * @param recordV2 The `RecordV2` object that will be serialized into the record via the update instruction
 * @param owner The owner of the domain
 * @param payer The fee payer of the transaction
 * @returns
 */
export const createRecordV2Instruction = (
  domain: string,
  record: Record,
  content: string,
  owner: PublicKey,
  payer: PublicKey,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new Error("Invalid parent");
  }

  const ix = allocateAndPostRecord(
    payer,
    pubkey,
    parent,
    owner,
    NAME_PROGRAM_ID,
    `\x02`.concat(record as string),
    serializeRecordV2Content(content, record),
    SNS_RECORDS_ID,
  );
  return ix;
};

export const updateRecordInstruction = async (
  connection: Connection,
  domain: string,
  record: Record,
  data: string,
  owner: PublicKey,
  payer: PublicKey,
) => {
  check(record !== Record.SOL, ErrorType.UnsupportedRecord);
  const { pubkey } = getDomainKeySync(`${record}.${domain}`, RecordVersion.V1);

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

  return [ix];
};

/**
 * This function updates the content of a record V2. The data serialization follows the SNS-IP 1 guidelines
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record enum object
 * @param recordV2 The `RecordV2` object to serialize into the record
 * @param owner The owner of the record/domain
 * @param payer The fee payer of the transaction
 * @returns The update record instructions
 */
export const updateRecordV2Instruction = (
  domain: string,
  record: Record,
  content: string,
  owner: PublicKey,
  payer: PublicKey,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new Error("Invalid parent");
  }

  const ix = editRecord(
    payer,
    pubkey,
    parent,
    owner,
    NAME_PROGRAM_ID,
    `\x02`.concat(record as string),
    serializeRecordV2Content(content, record),
    SNS_RECORDS_ID,
  );

  return ix;
};

/**
 * This function deletes a record v2 and returns the rent to the fee payer
 * @param domain The .sol domain name
 * @param record  The record type enum
 * @param owner The owner of the record to delete
 * @param payer The fee payer of the transaction
 * @returns The delete transaction instruction
 */
export const deleteRecordV2 = (
  domain: string,
  record: Record,
  owner: PublicKey,
  payer: PublicKey,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new Error("Invalid parent");
  }

  const ix = deleteRecord(
    payer,
    parent,
    owner,
    pubkey,
    NAME_PROGRAM_ID,
    SNS_RECORDS_ID,
  );
  return ix;
};

export const validateRecordV2Content = (
  staleness: boolean,
  domain: string,
  record: Record,
  owner: PublicKey,
  payer: PublicKey,
  verifier: PublicKey,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new Error("Invalid parent");
  }

  const ix = validateSolanaSignature(
    payer,
    pubkey,
    parent,
    owner,
    verifier,
    NAME_PROGRAM_ID,
    staleness,
    SNS_RECORDS_ID,
  );
  return ix;
};

export const writRoaRecordV2 = (
  domain: string,
  record: Record,
  owner: PublicKey,
  payer: PublicKey,
  roaId: PublicKey,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new Error("Invalid parent");
  }
  const ix = writeRoa(
    payer,
    NAME_PROGRAM_ID,
    pubkey,
    parent,
    owner,
    roaId,
    SNS_RECORDS_ID,
  );
  return ix;
};

export const ethValidateRecordV2Content = (
  domain: string,
  record: Record,
  owner: PublicKey,
  payer: PublicKey,
  signature: Buffer,
  expectedPubkey: Buffer,
) => {
  let { pubkey, parent, isSub } = getDomainKeySync(
    `${record}.${domain}`,
    RecordVersion.V2,
  );

  if (isSub) {
    parent = getDomainKeySync(domain).pubkey;
  }

  if (!parent) {
    throw new Error("Invalid parent");
  }

  const ix = validateEthSignature(
    payer,
    pubkey,
    parent,
    owner,
    NAME_PROGRAM_ID,
    Validation.Ethereum,
    signature,
    expectedPubkey,
    SNS_RECORDS_ID,
  );
  return ix;
};

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

  return [ix];
};

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

export const burnDomain = (
  domain: string,
  owner: PublicKey,
  target: PublicKey,
) => {
  const { pubkey } = getDomainKeySync(domain);
  const [state] = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer()],
    REGISTER_PROGRAM_ID,
  );
  const [resellingState] = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer(), Uint8Array.from([1, 1])],
    REGISTER_PROGRAM_ID,
  );

  const ix = new burnInstruction().getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    SystemProgram.programId,
    pubkey,
    getReverseKeySync(domain),
    resellingState,
    state,
    REVERSE_LOOKUP_CLASS,
    owner,
    target,
  );
  return ix;
};

export const registerWithNft = (
  name: string,
  space: number,
  nameAccount: PublicKey,
  reverseLookupAccount: PublicKey,
  buyer: PublicKey,
  nftSource: PublicKey,
  nftMetadata: PublicKey,
  nftMint: PublicKey,
  masterEdition: PublicKey,
) => {
  const [state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID,
  );
  const ix = new createWithNftInstruction({ space, name }).getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    nameAccount,
    reverseLookupAccount,
    SystemProgram.programId,
    REVERSE_LOOKUP_CLASS,
    buyer,
    nftSource,
    nftMetadata,
    nftMint,
    masterEdition,
    WOLVES_COLLECTION_METADATA,
    TOKEN_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    state,
    METAPLEX_ID,
  );
  return ix;
};

/**
 * This function is used to transfer the ownership of a subdomain in the Solana Name Service.
 *
 * @param {Connection} connection - The Solana RPC connection object.
 * @param {string} subdomain - The subdomain to transfer. It can be with or without .sol suffix (e.g., 'something.bonfida.sol' or 'something.bonfida').
 * @param {PublicKey} newOwner - The public key of the new owner of the subdomain.
 * @param {boolean} [isParentOwnerSigner=false] - A flag indicating whether the parent name owner is signing this transfer.
 * @param {PublicKey} [owner] - The public key of the current owner of the subdomain. This is an optional parameter. If not provided, the owner will be resolved automatically. This can be helpful to build transactions when the subdomain does not exist yet.
 *
 * @returns {Promise<TransactionInstruction>} - A promise that resolves to a Solana instruction for the transfer operation.
 */
export const transferSubdomain = async (
  connection: Connection,
  subdomain: string,
  newOwner: PublicKey,
  isParentOwnerSigner?: boolean,
  owner?: PublicKey,
): Promise<TransactionInstruction> => {
  const { pubkey, isSub, parent } = getDomainKeySync(subdomain);

  if (!parent || !isSub) {
    throw new SNSError(ErrorType.InvalidSubdomain);
  }

  if (!owner) {
    const { registry } = await NameRegistryState.retrieve(connection, pubkey);
    owner = registry.owner;
  }

  let nameParent: PublicKey | undefined = undefined;
  let nameParentOwner: PublicKey | undefined = undefined;

  if (isParentOwnerSigner) {
    nameParent = parent;
    nameParentOwner = (await NameRegistryState.retrieve(connection, parent))
      .registry.owner;
  }

  const ix = transferInstruction(
    NAME_PROGRAM_ID,
    pubkey,
    newOwner,
    owner,
    undefined,
    nameParent,
    nameParentOwner,
  );

  return ix;
};

/**
 * This function can be used to register a domain name as favorite
 * @param nameAccount The name account being registered as favorite
 * @param owner The owner of the name account
 * @param programId The name offer program ID
 * @returns
 */
export const registerFavorite = (nameAccount: PublicKey, owner: PublicKey) => {
  const [favKey] = FavouriteDomain.getKeySync(NAME_OFFERS_ID, owner);
  const ix = new registerFavoriteInstruction().getInstruction(
    NAME_OFFERS_ID,
    nameAccount,
    favKey,
    owner,
    SystemProgram.programId,
  );
  return [ix];
};
