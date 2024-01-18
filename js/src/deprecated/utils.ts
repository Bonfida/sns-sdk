import { Connection, PublicKey } from "@solana/web3.js";
import { sha256 } from "@noble/hashes/sha256";
import {
  HASH_PREFIX,
  NAME_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
} from "../constants";
import { NameRegistryState } from "../state";
import { REVERSE_LOOKUP_CLASS } from "../constants";
import { Buffer } from "buffer";
import { SNSError, ErrorType } from "../error";

/**
 * @deprecated Use {@link resolve} instead
 */
export async function getNameOwner(
  connection: Connection,
  nameAccountKey: PublicKey,
) {
  const nameAccount = await connection.getAccountInfo(nameAccountKey);
  if (!nameAccount) {
    throw new SNSError(ErrorType.AccountDoesNotExist);
  }
  return NameRegistryState.retrieve(connection, nameAccountKey);
}

/**
 * @deprecated Use {@link getHashedNameSync} instead
 */
export async function getHashedName(name: string): Promise<Buffer> {
  const input = HASH_PREFIX + name;
  const hashed = sha256(Buffer.from(input, "utf8"));
  return Buffer.from(hashed);
}

/**
 * @deprecated Use {@link getNameAccountKeySync} instead
 */
export async function getNameAccountKey(
  hashed_name: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): Promise<PublicKey> {
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
  const [nameAccountKey] = await PublicKey.findProgramAddress(
    seeds,
    NAME_PROGRAM_ID,
  );
  return nameAccountKey;
}

/**
 * This function can be used to perform a reverse look up
 * @deprecated Use {@link reverseLookup} instead
 * @param connection The Solana RPC connection
 * @param nameAccount The public key of the domain to look up
 * @returns The human readable domain name
 */
export async function performReverseLookup(
  connection: Connection,
  nameAccount: PublicKey,
): Promise<string> {
  const hashedReverseLookup = await getHashedName(nameAccount.toBase58());
  const reverseLookupAccount = await getNameAccountKey(
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
  const nameLength = registry.data.slice(0, 4).readUInt32LE(0);
  return registry.data.slice(4, 4 + nameLength).toString();
}

/**
 * This function can be used to perform a reverse look up
 * @deprecated Use {@link reverseLookupBatch} instead
 * @param connection The Solana RPC connection
 * @param nameAccount The public keys of the domains to look up
 * @returns The human readable domain names
 */
export async function performReverseLookupBatch(
  connection: Connection,
  nameAccounts: PublicKey[],
): Promise<(string | undefined)[]> {
  let reverseLookupAccounts: PublicKey[] = [];
  for (let nameAccount of nameAccounts) {
    const hashedReverseLookup = await getHashedName(nameAccount.toBase58());
    const reverseLookupAccount = await getNameAccountKey(
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
    const nameLength = name.data.slice(0, 4).readUInt32LE(0);
    return name.data.slice(4, 4 + nameLength).toString();
  });
}

const _derive = async (
  name: string,
  parent: PublicKey = ROOT_DOMAIN_ACCOUNT,
) => {
  let hashed = await getHashedName(name);
  let pubkey = await getNameAccountKey(hashed, undefined, parent);
  return { pubkey, hashed };
};

/**
 * This function can be used to compute the public key of a domain or subdomain
 * @deprecated Use {@link getDomainKeySync} instead
 * @param domain The domain to compute the public key for (e.g `bonfida.sol`, `dex.bonfida.sol`)
 * @param record Optional parameter: If the domain being resolved is a record
 * @returns
 */
export const getDomainKey = async (domain: string, record = false) => {
  if (domain.endsWith(".sol")) {
    domain = domain.slice(0, -4);
  }
  const splitted = domain.split(".");
  if (splitted.length === 2) {
    const prefix = Buffer.from([record ? 1 : 0]).toString();
    const sub = prefix.concat(splitted[0]);
    const { pubkey: parentKey } = await _derive(splitted[1]);
    const result = await _derive(sub, parentKey);
    return { ...result, isSub: true, parent: parentKey };
  } else if (splitted.length === 3 && record) {
    // Parent key
    const { pubkey: parentKey } = await _derive(splitted[2]);
    // Sub domain
    const { pubkey: subKey } = await _derive(
      "\0".concat(splitted[1]),
      parentKey,
    );
    // Sub record
    const recordPrefix = Buffer.from([1]).toString();
    const result = await _derive(recordPrefix.concat(splitted[0]), subKey);
    return { ...result, isSub: true, parent: parentKey, isSubRecord: true };
  } else if (splitted.length >= 3) {
    throw new SNSError(ErrorType.InvalidInput);
  }
  const result = await _derive(domain, ROOT_DOMAIN_ACCOUNT);
  return { ...result, isSub: false, parent: undefined };
};

/**
 * This function can be used to get the key of the reverse account
 * @deprecated Use {@link getReverseKeySync} instead
 * @param domain The domain to compute the reverse for
 * @param isSub Whether the domain is a subdomain or not
 * @returns The public key of the reverse account
 */
export const getReverseKey = async (domain: string, isSub?: boolean) => {
  const { pubkey, parent } = await getDomainKey(domain);
  const hashedReverseLookup = await getHashedName(pubkey.toBase58());
  const reverseLookupAccount = await getNameAccountKey(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS,
    isSub ? parent : undefined,
  );
  return reverseLookupAccount;
};
