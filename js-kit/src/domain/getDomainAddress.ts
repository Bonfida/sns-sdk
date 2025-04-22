import {
  CENTRAL_STATE_DOMAIN_RECORDS,
  ROOT_DOMAIN_ADDRESS,
} from "../constants/addresses";
import { InvalidInputError } from "../errors";
import { RecordVersion } from "../types/record";
import { deriveAddress } from "../utils/deriveAddress";

interface GetDomainAddressParams {
  domain: string;
  record?: RecordVersion;
}

/**
 * Derives the address of a domain, a subdomain, or a record.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The (sub)domain to process, with or without the .sol suffix.
 *   - `record`: (Optional) The record version. Only provide if the domain being resolved is a record.
 * @returns A promise that resolves to an object containing the derived address and additional metadata.
 */
export const getDomainAddress = async ({
  domain,
  record,
}: GetDomainAddressParams) => {
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
    const parentAddress = await deriveAddress(splitted[1], ROOT_DOMAIN_ADDRESS);
    const domainAddress = await deriveAddress(
      recordPrefix + splitted[0],
      parentAddress,
      recordClass
    );

    return { domainAddress, parentAddress, isSub: true };
  } else if (splitted.length === 3 && !!record) {
    // Parent domain
    const parentAddress = await deriveAddress(splitted[2], ROOT_DOMAIN_ADDRESS);

    // Sub domain
    const subAddress = await deriveAddress("\0" + splitted[1], parentAddress);

    // Sub record
    const domainAddress = await deriveAddress(
      recordPrefix + splitted[0],
      subAddress,
      recordClass
    );

    return { domainAddress, parentAddress, isSub: true, isSubRecord: true };
  } else if (splitted.length >= 3) {
    throw new InvalidInputError("The domain is malformed");
  }

  const domainAddress = await deriveAddress(domain, ROOT_DOMAIN_ADDRESS);

  return { domainAddress, isSub: false };
};
