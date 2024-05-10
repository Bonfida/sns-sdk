import { Connection, PublicKey, MemcmpFilter } from "@solana/web3.js";
import { sha256 } from "@noble/hashes/sha256";
import {
  DEFAULT_PYTH_PUSH_PROGRAM,
  HASH_PREFIX,
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
} from "./constants";
import { NameRegistryState } from "./state";
import { REVERSE_LOOKUP_CLASS } from "./constants";
import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";
import { CENTRAL_STATE_SNS_RECORDS } from "@bonfida/sns-records";
import { RecordVersion } from "./types/record";
import { retrieveRecords } from "./nft";
import splitGraphemes from "graphemesplit";

export const getHashedNameSync = (name: string): Buffer => {
  const input = HASH_PREFIX + name;
  const hashed = sha256(Buffer.from(input, "utf8"));
  return Buffer.from(hashed);
};

export const getNameAccountKeySync = (
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
    NAME_PROGRAM_ID,
  );
  return nameAccountKey;
};

/**
 * This function can be used to perform a reverse look up
 * @param connection The Solana RPC connection
 * @param nameAccount The public key of the domain to look up
 * @returns The human readable domain name
 */
export async function reverseLookup(
  connection: Connection,
  nameAccount: PublicKey,
): Promise<string> {
  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
  );

  const { registry } = await NameRegistryState.retrieve(
    connection,
    reverseLookupAccount,
  );
  if (!registry.data) {
    throw new SNSError(ErrorType.NoAccountData);
  }

  return deserializeReverse(registry.data);
}

/**
 * This function can be used to perform a reverse look up
 * @param connection The Solana RPC connection
 * @param nameAccount The public keys of the domains to look up
 * @returns The human readable domain names
 */
export async function reverseLookupBatch(
  connection: Connection,
  nameAccounts: PublicKey[],
): Promise<(string | undefined)[]> {
  let reverseLookupAccounts: PublicKey[] = [];
  for (let nameAccount of nameAccounts) {
    const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
    const reverseLookupAccount = getNameAccountKeySync(
      hashedReverseLookup,
      REVERSE_LOOKUP_CLASS,
    );
    reverseLookupAccounts.push(reverseLookupAccount);
  }

  let names = await NameRegistryState.retrieveBatch(
    connection,
    reverseLookupAccounts,
  );

  return names.map((name) => {
    if (name === undefined || name.data === undefined) {
      return undefined;
    }
    return deserializeReverse(name.data);
  });
}

/**
 *
 * @param connection The Solana RPC connection object
 * @param parentKey The parent you want to find sub-domains for
 * @returns
 */
export const findSubdomains = async (
  connection: Connection,
  parentKey: PublicKey,
): Promise<string[]> => {
  // Fetch reverse accounts
  const filtersRevs: MemcmpFilter[] = [
    {
      memcmp: {
        offset: 0,
        bytes: parentKey.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 64,
        bytes: REVERSE_LOOKUP_CLASS.toBase58(),
      },
    },
  ];
  const reverses = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters: filtersRevs,
  });

  const filtersSubs: MemcmpFilter[] = [
    {
      memcmp: {
        offset: 0,
        bytes: parentKey.toBase58(),
      },
    },
  ];
  const subs = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters: filtersSubs,
    dataSlice: { offset: 0, length: 0 },
  });

  const map = new Map<string, string | undefined>(
    reverses.map((e) => [
      e.pubkey.toBase58(),
      deserializeReverse(e.account.data.slice(96)),
    ]),
  );

  const result: string[] = [];
  subs.forEach((e) => {
    const revKey = getReverseKeyFromDomainKey(e.pubkey, parentKey).toBase58();
    const rev = map.get(revKey);
    if (!!rev) {
      result.push(rev.replace("\0", ""));
    }
  });

  return result;
};

const _deriveSync = (
  name: string,
  parent: PublicKey = ROOT_DOMAIN_ACCOUNT,
  classKey?: PublicKey,
) => {
  let hashed = getHashedNameSync(name);
  let pubkey = getNameAccountKeySync(hashed, classKey, parent);
  return { pubkey, hashed };
};

/**
 * This function can be used to compute the public key of a domain or subdomain
 * @param domain The domain to compute the public key for (e.g `bonfida.sol`, `dex.bonfida.sol`)
 * @param record Optional parameter: If the domain being resolved is a record
 * @returns
 */
export const getDomainKeySync = (domain: string, record?: RecordVersion) => {
  if (domain.endsWith(".sol")) {
    domain = domain.slice(0, -4);
  }
  const recordClass =
    record === RecordVersion.V2 ? CENTRAL_STATE_SNS_RECORDS : undefined;
  const splitted = domain.split(".");
  if (splitted.length === 2) {
    const prefix = Buffer.from([record ? record : 0]).toString();
    const sub = prefix.concat(splitted[0]);
    const { pubkey: parentKey } = _deriveSync(splitted[1]);
    const result = _deriveSync(sub, parentKey, recordClass);
    return { ...result, isSub: true, parent: parentKey };
  } else if (splitted.length === 3 && !!record) {
    // Parent key
    const { pubkey: parentKey } = _deriveSync(splitted[2]);
    // Sub domain
    const { pubkey: subKey } = _deriveSync("\0".concat(splitted[1]), parentKey);
    // Sub record
    const recordPrefix = record === RecordVersion.V2 ? `\x02` : `\x01`;
    const result = _deriveSync(
      recordPrefix.concat(splitted[0]),
      subKey,
      recordClass,
    );
    return { ...result, isSub: true, parent: parentKey, isSubRecord: true };
  } else if (splitted.length >= 3) {
    throw new SNSError(ErrorType.InvalidInput);
  }
  const result = _deriveSync(domain, ROOT_DOMAIN_ACCOUNT);
  return { ...result, isSub: false, parent: undefined };
};

/**
 * This function can be used to retrieve all domain names owned by `wallet`
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns
 */
export async function getAllDomains(
  connection: Connection,
  wallet: PublicKey,
): Promise<PublicKey[]> {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: wallet.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 0,
        bytes: ROOT_DOMAIN_ACCOUNT.toBase58(),
      },
    },
  ];
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters,
  });
  return accounts.map((a) => a.pubkey);
}

/**
 * This function can be used to retrieve all domain names owned by `wallet` in a human readable format
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns Array of pubkeys and the corresponding human readable domain names
 */
export async function getDomainKeysWithReverses(
  connection: Connection,
  wallet: PublicKey,
) {
  const encodedNameArr = await getAllDomains(connection, wallet);
  const names = await reverseLookupBatch(connection, encodedNameArr);

  return encodedNameArr.map((pubKey, index) => ({
    pubKey,
    domain: names[index],
  }));
}

/**
 * This function can be used to retrieve all the registered `.sol` domains.
 * The account data is sliced to avoid enormous payload and only the owner is returned
 * @param connection The Solana RPC connection object
 * @returns
 */
export const getAllRegisteredDomains = async (connection: Connection) => {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: ROOT_DOMAIN_ACCOUNT.toBase58(),
      },
    },
  ];
  const dataSlice = { offset: 32, length: 32 };

  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    dataSlice,
    filters,
  });
  return accounts;
};

/**
 * This function can be used to get the key of the reverse account
 * @param domain The domain to compute the reverse for
 * @param isSub Whether the domain is a subdomain or not
 * @returns The public key of the reverse account
 */
export const getReverseKeySync = (domain: string, isSub?: boolean) => {
  const { pubkey, parent } = getDomainKeySync(domain);
  const hashedReverseLookup = getHashedNameSync(pubkey.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
    isSub ? parent : undefined,
  );
  return reverseLookupAccount;
};

/**
 * This function can be used to get the reverse key from a domain key
 * @param domainKey The domain key to compute the reverse for
 * @param parent The parent public key
 * @returns The public key of the reverse account
 */
export const getReverseKeyFromDomainKey = (
  domainKey: PublicKey,
  parent?: PublicKey,
) => {
  const hashedReverseLookup = getHashedNameSync(domainKey.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
    parent,
  );
  return reverseLookupAccount;
};

export const check = (bool: boolean, errorType: ErrorType) => {
  if (!bool) {
    throw new SNSError(errorType);
  }
};

/**
 * This function can be used to retrieve all the tokenized domains of an owner
 * @param connection The Solana RPC connection object
 * @param owner The owner of the tokenized domains
 * @returns
 */
export const getTokenizedDomains = async (
  connection: Connection,
  owner: PublicKey,
) => {
  const nftRecords = await retrieveRecords(connection, owner);

  const names = await reverseLookupBatch(
    connection,
    nftRecords.map((e) => e.nameAccount),
  );

  return names
    .map((e, idx) => {
      return {
        key: nftRecords[idx].nameAccount,
        mint: nftRecords[idx].nftMint,
        reverse: e,
      };
    })
    .filter((e) => !!e.reverse);
};

/**
 * This function can be used to retrieve the registration cost in USD of a domain
 * from its name
 * @param name - Domain name
 * @returns price
 */
export const getDomainPriceFromName = (name: string) => {
  const split = splitGraphemes(name);

  switch (split.length) {
    case 1:
      return 750;
    case 2:
      return 700;
    case 3:
      return 640;
    case 4:
      return 160;
    default:
      return 20;
  }
};

export function deserializeReverse(data: Buffer): string;
export function deserializeReverse(data: undefined): undefined;

export function deserializeReverse(
  data: Buffer | undefined,
): string | undefined {
  if (!data) return undefined;
  const nameLength = data.slice(0, 4).readUInt32LE(0);
  return data.slice(4, 4 + nameLength).toString();
}

export const getPythFeedAccountKey = (shard: number, priceFeed: number[]) => {
  const buffer = Buffer.alloc(2);
  buffer.writeUint16LE(shard);
  return PublicKey.findProgramAddressSync(
    [buffer, Buffer.from(priceFeed)],
    DEFAULT_PYTH_PUSH_PROGRAM,
  );
};
