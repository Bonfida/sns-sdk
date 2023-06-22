import { Connection, PublicKey, MemcmpFilter } from "@solana/web3.js";
import BN from "bn.js";
import { sha256 } from "@ethersproject/sha2";
import { HASH_PREFIX, NAME_PROGRAM_ID, ROOT_DOMAIN_ACCOUNT } from "./constants";
import { NameRegistryState } from "./state";
import { REVERSE_LOOKUP_CLASS } from "./constants";
import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";

export const getHashedNameSync = (name: string): Buffer => {
  const input = HASH_PREFIX + name;
  const str = sha256(Buffer.from(input, "utf8")).slice(2);
  return Buffer.from(str, "hex");
};

export const getNameAccountKeySync = (
  hashed_name: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey
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
    NAME_PROGRAM_ID
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
  nameAccount: PublicKey
): Promise<string> {
  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS
  );

  const { registry } = await NameRegistryState.retrieve(
    connection,
    reverseLookupAccount
  );
  if (!registry.data) {
    throw new SNSError(ErrorType.NoAccountData);
  }
  const nameLength = new BN(registry.data.slice(0, 4), "le").toNumber();
  return registry.data.slice(4, 4 + nameLength).toString();
}

/**
 * This function can be used to perform a reverse look up
 * @param connection The Solana RPC connection
 * @param nameAccount The public keys of the domains to look up
 * @returns The human readable domain names
 */
export async function reverseLookupBatch(
  connection: Connection,
  nameAccounts: PublicKey[]
): Promise<(string | undefined)[]> {
  let reverseLookupAccounts: PublicKey[] = [];
  for (let nameAccount of nameAccounts) {
    const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
    const reverseLookupAccount = getNameAccountKeySync(
      hashedReverseLookup,
      REVERSE_LOOKUP_CLASS
    );
    reverseLookupAccounts.push(reverseLookupAccount);
  }

  let names = await NameRegistryState.retrieveBatch(
    connection,
    reverseLookupAccounts
  );

  return names.map((name) => {
    if (name === undefined || name.data === undefined) {
      return undefined;
    }
    let nameLength = new BN(name.data.slice(0, 4), "le").toNumber();
    return name.data.slice(4, 4 + nameLength).toString();
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
  parentKey: PublicKey
): Promise<string[]> => {
  // Fetch reverse accounts
  const filtersReverse: MemcmpFilter[] = [
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
  const reverse = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters: filtersReverse,
  });

  const parent = await reverseLookup(connection, parentKey);
  const subs = reverse.map((e) =>
    e.account.data.slice(97).toString("utf-8")?.split("\0").join("")
  );

  const keys = subs.map((e) => getDomainKeySync(e + "." + parent).pubkey);
  const subsAcc = await connection.getMultipleAccountsInfo(keys);

  return subs.filter((_, idx) => !!subsAcc[idx]);
};

const _deriveSync = (name: string, parent: PublicKey = ROOT_DOMAIN_ACCOUNT) => {
  let hashed = getHashedNameSync(name);
  let pubkey = getNameAccountKeySync(hashed, undefined, parent);
  return { pubkey, hashed };
};

/**
 * This function can be used to compute the public key of a domain or subdomain
 * @param domain The domain to compute the public key for (e.g `bonfida.sol`, `dex.bonfida.sol`)
 * @param record Optional parameter: If the domain being resolved is a record
 * @returns
 */
export const getDomainKeySync = (domain: string, record = false) => {
  if (domain.endsWith(".sol")) {
    domain = domain.slice(0, -4);
  }
  const splitted = domain.split(".");
  if (splitted.length === 2) {
    const prefix = Buffer.from([record ? 1 : 0]).toString();
    const sub = prefix.concat(splitted[0]);
    const { pubkey: parentKey } = _deriveSync(splitted[1]);
    const result = _deriveSync(sub, parentKey);
    return { ...result, isSub: true, parent: parentKey };
  } else if (splitted.length === 3 && record) {
    // Parent key
    const { pubkey: parentKey } = _deriveSync(splitted[2]);
    // Sub domain
    const { pubkey: subKey } = _deriveSync("\0".concat(splitted[1]), parentKey);
    // Sub record
    const recordPrefix = Buffer.from([1]).toString();
    const result = _deriveSync(recordPrefix.concat(splitted[0]), subKey);
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
  wallet: PublicKey
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
    isSub ? parent : undefined
  );
  return reverseLookupAccount;
};

export const check = (bool: boolean, errorType: ErrorType) => {
  if (!bool) {
    throw new SNSError(errorType);
  }
};
