import { Address } from "@solana/kit";

import { REVERSE_LOOKUP_CLASS } from "../constants/addresses";
import { deriveAddress } from "./deriveAddress";

/**
 * Derive the reverse address from a domain address
 *
 * @param domainKey The domain address to compute the reverse for
 * @param parentAddress The parent address
 * @returns The address of the reverse account
 */
export const getReverseAddress = async (
  domainAddress: Address,
  parentAddress?: Address
) => {
  return await deriveAddress(
    domainAddress,
    parentAddress,
    REVERSE_LOOKUP_CLASS
  );
};
