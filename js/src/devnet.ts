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
  createSplitV2Instruction,
} from "./instructions";
import { NameRegistryState } from "./state";
import { Numberu64, Numberu32 } from "./int";
import { getHashedName, getNameOwner } from "./deprecated/utils";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import { ErrorType, SNSError } from "./error";
import {
  deserializeReverse,
  getHashedNameSync,
  getPythFeedAccountKey,
} from "./utils";
import { PYTH_PULL_FEEDS } from "./constants";

const constants = {
  /**
   * The Solana Name Service program ID
   */
  NAME_PROGRAM_ID: new PublicKey("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"),

  /**
   * Hash prefix used to derive domain name addresses
   */
  HASH_PREFIX: "SPL Name Service",

  /**
   * The `.sol` TLD
   */
  ROOT_DOMAIN_ACCOUNT: new PublicKey(
    "5eoDkP6vCQBXqDV9YN2NdUs3nmML3dMRNmEYpiyVNBm2",
  ),

  /**
   * The Registry program ID
   */
  REGISTER_PROGRAM_ID: new PublicKey(
    "snshBoEQ9jx4QoHBpZDQPYdNCtw7RMxJvYrKFEhwaPJ",
  ),

  /**
   * The reverse look up class
   */
  REVERSE_LOOKUP_CLASS: new PublicKey(
    "7NbD1vprif6apthEZAqhRfYuhrqnuderB8qpnfXGCc8H",
  ),

  USDC_MINT: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),

  REFERRERS: [
    new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1"), // Test wallet,
  ],

  TOKENS_SYM_MINT: new Map<string, string>([
    ["4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", "USDC"],
    ["EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS", "USDT"],
    ["So11111111111111111111111111111111111111112", "SOL"],
    ["fidaWCioBQjieRrUQDxxS5Uxmq1CLi2VuVRyv4dEBey", "FIDA"],
    ["DL4ivZm3NVHWk9ZvtcqTchxoKArDK4rT3vbDx2gYVr7P", "INJ"],
  ]),

  PYTH_FEEDS: new Map<string, { price: string; product: string }>([
    [
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      {
        price: "5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7",
        product: "6NpdXrQEpmDZ3jZKmM2rhdmkd3H6QAk23j2x8bkXcHKA",
      },
    ],
    [
      "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS",
      {
        price: "38xoQ4oeJCBrcVvca2cGk7iV1dAfrmTR1kmhSCJQ8Jto",
        product: "C5wDxND9E61RZ1wZhaSTWkoA8udumaHnoQY6BBsiaVpn",
      },
    ],
    [
      "So11111111111111111111111111111111111111112",
      {
        price: "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
        product: "3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E",
      },
    ],
    [
      "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
      {
        price: "7teETxN9Y8VK6uJxsctHEwST75mKLLwPH1jaFdvTQCpD",
        product: "5kWV4bhHeZANzg5MWaYCQYEEKHjur5uz1mu5vuLHwiLB",
      },
    ],
    [
      "DL4ivZm3NVHWk9ZvtcqTchxoKArDK4rT3vbDx2gYVr7P",
      {
        price: "44uRsNnT35kjkscSu59MxRr9CfkLZWf6gny8bWqUbVxE",
        product: "7UHB783Nh4avW3Yw9yoktf2KjxipU56KPahA51RnCCYE",
      },
    ],
  ]),

  PYTH_MAPPING_ACC: new PublicKey(
    "BmA9Z6FjioHJPpjT39QazZyhDRUdZy2ezwx4GiDdE2u2",
  ),

  VAULT_OWNER: new PublicKey("SNSaTJbEv2iT3CUrCQYa9zpGjbBVWhFCPaSJHkaJX34"),
};

const getNameAccountKeySync = (
  hashed_name: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): PublicKey => {
  const seeds = [hashed_name];
  if (nameClass) {
    seeds.push(nameClass.toBuffer());
  } else {
    seeds.push(Buffer.alloc(32));
  }
  if (nameParent) {
    seeds.push(nameParent.toBuffer());
  } else {
    seeds.push(Buffer.alloc(32));
  }
  const [nameAccountKey] = PublicKey.findProgramAddressSync(
    seeds,
    constants.NAME_PROGRAM_ID,
  );
  return nameAccountKey;
};

const reverseLookup = async (
  connection: Connection,
  nameAccount: PublicKey,
): Promise<string> => {
  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    constants.REVERSE_LOOKUP_CLASS,
  );

  const { registry } = await NameRegistryState.retrieve(
    connection,
    reverseLookupAccount,
  );
  if (!registry.data) {
    throw new SNSError(ErrorType.NoAccountData);
  }
  return deserializeReverse(registry.data);
};

const _deriveSync = (
  name: string,
  parent: PublicKey = constants.ROOT_DOMAIN_ACCOUNT,
  classKey?: PublicKey,
) => {
  let hashed = getHashedNameSync(name);
  let pubkey = getNameAccountKeySync(hashed, classKey, parent);
  return { pubkey, hashed };
};

const getDomainKeySync = (domain: string) => {
  if (domain.endsWith(".sol")) {
    domain = domain.slice(0, -4);
  }

  const splitted = domain.split(".");
  if (splitted.length === 2) {
    const prefix = "\0";
    const sub = prefix.concat(splitted[0]);
    const { pubkey: parentKey } = _deriveSync(splitted[1]);
    const result = _deriveSync(sub, parentKey);
    return { ...result, isSub: true, parent: parentKey };
  } else if (splitted.length >= 3) {
    throw new SNSError(ErrorType.InvalidInput);
  }
  const result = _deriveSync(domain, constants.ROOT_DOMAIN_ACCOUNT);
  return { ...result, isSub: false, parent: undefined };
};

const getReverseKeySync = (domain: string, isSub?: boolean) => {
  const { pubkey, parent } = getDomainKeySync(domain);
  const hashedReverseLookup = getHashedNameSync(pubkey.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    constants.REVERSE_LOOKUP_CLASS,
    isSub ? parent : undefined,
  );
  return reverseLookupAccount;
};

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
async function createNameRegistry(
  connection: Connection,
  name: string,
  space: number,
  payerKey: PublicKey,
  nameOwner: PublicKey,
  lamports?: number,
  nameClass?: PublicKey,
  parentName?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
  const nameAccountKey = await getNameAccountKeySync(
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
    constants.NAME_PROGRAM_ID,
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
async function updateNameRegistryData(
  connection: Connection,
  name: string,
  offset: number,
  input_data: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
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
    constants.NAME_PROGRAM_ID,
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
async function transferNameOwnership(
  connection: Connection,
  name: string,
  newOwner: PublicKey,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
  parentOwner?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
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
    constants.NAME_PROGRAM_ID,
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
async function deleteNameRegistry(
  connection: Connection,
  name: string,
  refundTargetKey: PublicKey,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): Promise<TransactionInstruction> {
  const hashed_name = await getHashedName(name);
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
    constants.NAME_PROGRAM_ID,
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
const registerDomainName = async (
  connection: Connection,
  name: string,
  space: number,
  buyer: PublicKey,
  buyerTokenAccount: PublicKey,
  mint = constants.USDC_MINT,
  referrerKey?: PublicKey,
) => {
  // Basic validation
  if (name.includes(".") || name.trim().toLowerCase() !== name) {
    throw new SNSError(ErrorType.InvalidDomain);
  }
  const [cs] = PublicKey.findProgramAddressSync(
    [constants.REGISTER_PROGRAM_ID.toBuffer()],
    constants.REGISTER_PROGRAM_ID,
  );

  const hashed = getHashedNameSync(name);
  const nameAccount = getNameAccountKeySync(
    hashed,
    undefined,
    constants.ROOT_DOMAIN_ACCOUNT,
  );

  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(hashedReverseLookup, cs);

  const [derived_state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    constants.REGISTER_PROGRAM_ID,
  );

  const refIdx = constants.REFERRERS.findIndex((e) => referrerKey?.equals(e));
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

  const vault = getAssociatedTokenAddressSync(mint, constants.VAULT_OWNER);
  const pythFeed = devnet.constants.PYTH_FEEDS.get(mint.toBase58());

  if (!pythFeed) {
    throw new SNSError(ErrorType.PythFeedNotFound);
  }

  const ix = new createInstructionV3({
    name,
    space,
    referrerIdxOpt: refIdx != -1 ? refIdx : null,
  }).getInstruction(
    constants.REGISTER_PROGRAM_ID,
    constants.NAME_PROGRAM_ID,
    constants.ROOT_DOMAIN_ACCOUNT,
    nameAccount,
    reverseLookupAccount,
    SystemProgram.programId,
    cs,
    buyer,
    buyerTokenAccount,
    constants.PYTH_MAPPING_ACC,
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
 *
 * @param nameAccount The name account to create the reverse account for
 * @param name The name of the domain
 * @param feePayer The fee payer of the transaction
 * @param parentName The parent name account
 * @param parentNameOwner The parent name owner
 * @returns
 */
const createReverseName = async (
  nameAccount: PublicKey,
  name: string,
  feePayer: PublicKey,
  parentName?: PublicKey,
  parentNameOwner?: PublicKey,
) => {
  let [centralState] = await PublicKey.findProgramAddress(
    [constants.REGISTER_PROGRAM_ID.toBuffer()],
    constants.REGISTER_PROGRAM_ID,
  );

  let hashedReverseLookup = await getHashedName(nameAccount.toBase58());
  let reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    centralState,
    parentName,
  );

  let initCentralStateInstruction = new createReverseInstruction({
    name,
  }).getInstruction(
    constants.REGISTER_PROGRAM_ID,
    constants.NAME_PROGRAM_ID,
    constants.ROOT_DOMAIN_ACCOUNT,
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
 */
const createSubdomain = async (
  connection: Connection,
  subdomain: string,
  owner: PublicKey,
  space = 2_000,
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
    owner,
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
      owner,
      parent,
      owner,
    );
    ixs.push(...ix_reverse);
  }

  return [[], ixs];
};

const burnDomain = (domain: string, owner: PublicKey, target: PublicKey) => {
  const { pubkey } = getDomainKeySync(domain);
  const [state] = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer()],
    constants.REGISTER_PROGRAM_ID,
  );
  const [resellingState] = PublicKey.findProgramAddressSync(
    [pubkey.toBuffer(), Uint8Array.from([1, 1])],
    constants.REGISTER_PROGRAM_ID,
  );

  const ix = new burnInstruction().getInstruction(
    constants.REGISTER_PROGRAM_ID,
    constants.NAME_PROGRAM_ID,
    SystemProgram.programId,
    pubkey,
    getReverseKeySync(domain),
    resellingState,
    state,
    constants.REVERSE_LOOKUP_CLASS,
    owner,
    target,
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
const transferSubdomain = async (
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
    constants.NAME_PROGRAM_ID,
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
const registerDomainNameV2 = async (
  connection: Connection,
  name: string,
  space: number,
  buyer: PublicKey,
  buyerTokenAccount: PublicKey,
  mint = constants.USDC_MINT,
  referrerKey?: PublicKey,
) => {
  // Basic validation
  if (name.includes(".") || name.trim().toLowerCase() !== name) {
    throw new SNSError(ErrorType.InvalidDomain);
  }
  const [cs] = PublicKey.findProgramAddressSync(
    [constants.REGISTER_PROGRAM_ID.toBuffer()],
    constants.REGISTER_PROGRAM_ID,
  );

  const hashed = getHashedNameSync(name);
  const nameAccount = getNameAccountKeySync(
    hashed,
    undefined,
    constants.ROOT_DOMAIN_ACCOUNT,
  );

  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(hashedReverseLookup, cs);

  const [derived_state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    constants.REGISTER_PROGRAM_ID,
  );

  const refIdx = constants.REFERRERS.findIndex((e) => referrerKey?.equals(e));
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

  const vault = getAssociatedTokenAddressSync(
    mint,
    constants.VAULT_OWNER,
    true,
  );
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
    constants.REGISTER_PROGRAM_ID,
    constants.NAME_PROGRAM_ID,
    constants.ROOT_DOMAIN_ACCOUNT,
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

export const devnet = {
  utils: {
    getNameAccountKeySync,
    reverseLookup,
    _deriveSync,
    getDomainKeySync,
    getReverseKeySync,
  },
  constants,
  bindings: {
    createNameRegistry,
    updateNameRegistryData,
    transferNameOwnership,
    deleteNameRegistry,
    registerDomainName,
    createReverseName,
    createSubdomain,
    burnDomain,
    transferSubdomain,
    registerDomainNameV2,
  },
};
