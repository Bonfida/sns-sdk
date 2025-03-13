import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  ROOT_DOMAIN_ACCOUNT,
} from "../constants/addresses";
import { InvalidInputError } from "../errors";
import { RecordVersion } from "../types/record";
import { deriveAddress } from "../utils/deriveAddress";

/**
 * This function can be used to compute the public key of a domain or subdomain
 * @param domain The domain to compute the public key for (e.g `bonfida.sol`, `dex.bonfida.sol`)
 * @param record Optional parameter: If the domain being resolved is a record
 * @returns
 */
export const getDomainAddress = async (
  domain: string,
  record?: RecordVersion
) => {
  if (domain.endsWith(".sol")) {
    domain = domain.slice(0, -4);
  }

  const recordClass =
    record === RecordVersion.V2 ? CENTRAL_STATE_DOMAIN_RECORDS : undefined;
  const recordPrefix =
    {
      [RecordVersion.V2]: "\x02",
      [RecordVersion.V1]: "\x01",
    }[record as RecordVersion] || "\x00";
  const splitted = domain.split(".");

  if (splitted.length === 2) {
    const parentAddress = await deriveAddress(splitted[1], ROOT_DOMAIN_ACCOUNT);
    const address = await deriveAddress(
      recordPrefix + splitted[0],
      parentAddress,
      recordClass
    );

    return { address, parentAddress, isSub: true };
  } else if (splitted.length === 3 && !!record) {
    // Parent domain
    const parentAddress = await deriveAddress(splitted[2], ROOT_DOMAIN_ACCOUNT);

    // Sub domain
    const subAddress = await deriveAddress("\0" + splitted[1], parentAddress);

    // Sub record
    const address = await deriveAddress(
      recordPrefix + splitted[0],
      subAddress,
      recordClass
    );

    return { address, parentAddress, isSub: true, isSubRecord: true };
  } else if (splitted.length >= 3) {
    throw new InvalidInputError("The domain is malformed");
  }

  const address = await deriveAddress(domain, ROOT_DOMAIN_ACCOUNT);

  return { address, isSub: false };
};
