import { PublicKey } from "@solana/web3.js";
import { ROOT_DOMAIN_ACCOUNT } from "../constants";
import { Buffer } from "buffer";
import { CENTRAL_STATE_SNS_RECORDS } from "@bonfida/sns-records";
import { RecordVersion } from "../types/record";
import { InvalidInputError } from "../error";

import { getHashedNameSync } from "./getHashedNameSync";
import { getNameAccountKeySync } from "./getNameAccountKeySync";

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
    throw new InvalidInputError("The domain is malformed");
  }
  const result = _deriveSync(domain, ROOT_DOMAIN_ACCOUNT);
  return { ...result, isSub: false, parent: undefined };
};
