import {
  Address,
  GetAccountInfoApi,
  GetMinimumBalanceForRentExemptionApi,
  IInstruction,
  Rpc,
  fetchEncodedAccount,
} from "@solana/kit";

import { getDomainAddress } from "../domain/getDomainAddress";
import { InvalidDomainError } from "../errors";
import { RegistryState } from "../states/registry";
import { getReverseAddress } from "../utils/getReverseAddress";
import { createNameRegistry } from "./createNameRegistry";
import { createReverse } from "./createReverse";

/**
 * Creates a subdomain for the specified domain. This includes setting up the subdomain
 * registry and its reverse lookup record if not already existing.
 *
 * @param rpc - An RPC interface implementing GetAccountInfoApi and GetMinimumBalanceForRentExemptionApi.
 * @param subdomain - The subdomain to create, with or without .sol (e.g., something.sns.sol or something.sns).
 * @param owner - The address of the owner of the parent domain.
 * @param space - (Optional) The space in bytes allocated to the subdomain account (default: 2,000).
 * @param feePayer - (Optional) The address funding the subdomain creation. (default: owner address).
 * @returns A promise that resolves to an array of instructions required to create the subdomain
 *   and its reverse lookup record.
 */

export const createSubdomain = async (
  rpc: Rpc<GetAccountInfoApi & GetMinimumBalanceForRentExemptionApi>,
  subdomain: string,
  owner: Address,
  space = 2_000,
  feePayer?: Address
) => {
  const ixs: IInstruction[] = [];
  const sub = subdomain.split(".")[0];

  if (!sub) {
    throw new InvalidDomainError("The subdomain name is malformed");
  }

  const [{ address, parentAddress }, lamports] = await Promise.all([
    getDomainAddress(subdomain),
    rpc
      .getMinimumBalanceForRentExemption(
        BigInt(space + RegistryState.HEADER_LEN)
      )
      .send(),
  ]);

  const ix_create = await createNameRegistry(
    rpc,
    "\0".concat(sub),
    space, // Hardcode space to 2kB
    feePayer || owner,
    owner,
    lamports,
    undefined,
    parentAddress
  );
  ixs.push(ix_create);

  // Create the reverse name
  const reverseKey = await getReverseAddress(subdomain);
  const reverseAccount = await fetchEncodedAccount(rpc, reverseKey);

  if (!reverseAccount.exists) {
    const ix_reverse = await createReverse(
      address,
      "\0".concat(sub),
      feePayer || owner,
      parentAddress,
      owner
    );
    ixs.push(ix_reverse);
  }

  return ixs;
};
