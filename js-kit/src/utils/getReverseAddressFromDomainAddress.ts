import { Address } from "@solana/kit";

import { REVERSE_LOOKUP_CLASS } from "../constants/addresses";
import { deriveAddress } from "./deriveAddress";

interface GetReverseAddressFromDomainAddressParams {
  domainAddress: Address;
  parentAddress?: Address;
}

/**
 * Derive the reverse address from a domain address.
 *
 * @param params - An object containing the following properties:
 *   - `domainAddress`: The domain address to compute the reverse for.
 *   - `parentAddress`: The parent address (optional).
 * @returns The address of the reverse account.
 */
export const getReverseAddressFromDomainAddress = async ({
  domainAddress,
  parentAddress,
}: GetReverseAddressFromDomainAddressParams): Promise<Address> => {
  return await deriveAddress(
    domainAddress,
    parentAddress,
    REVERSE_LOOKUP_CLASS
  );
};
