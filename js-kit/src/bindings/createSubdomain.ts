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

interface CreateSubdomainParams {
  rpc: Rpc<GetAccountInfoApi & GetMinimumBalanceForRentExemptionApi>;
  subdomain: string;
  owner: Address;
  space?: number;
  feePayer?: Address;
}

/**
 * Creates a subdomain for the specified domain. This includes setting up the subdomain
 * registry and its reverse lookup record if not already existing.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetAccountInfoApi and GetMinimumBalanceForRentExemptionApi.
 *   - `subdomain`: The subdomain to create, with or without .sol (e.g., something.sns.sol or something.sns).
 *   - `owner`: The address of the owner of the parent domain.
 *   - `space`: (Optional) The space in bytes allocated to the subdomain account (default: 2,000).
 *   - `feePayer`: (Optional) The address funding the subdomain creation (default: owner address).
 * @returns A promise that resolves to an array of instructions required to create the subdomain
 *   and its reverse lookup record.
 */
export const createSubdomain = async ({
  rpc,
  subdomain,
  owner,
  space = 2_000,
  feePayer,
}: CreateSubdomainParams): Promise<IInstruction[]> => {
  const ixs: IInstruction[] = [];
  const sub = subdomain.split(".")[0];

  if (!sub) {
    throw new InvalidDomainError("The subdomain name is malformed");
  }

  const [{ domainAddress, parentAddress }, lamports] = await Promise.all([
    getDomainAddress({ domain: subdomain }),
    rpc
      .getMinimumBalanceForRentExemption(
        BigInt(space + RegistryState.HEADER_LEN)
      )
      .send(),
  ]);

  const ix_create = await createNameRegistry({
    rpc,
    name: "\0".concat(sub),
    space,
    payer: feePayer || owner,
    owner,
    lamports,
    classAddress: undefined,
    parentAddress,
  });
  ixs.push(ix_create);

  // Create the reverse name
  const reverseKey = await getReverseAddress(subdomain);
  const reverseAccount = await fetchEncodedAccount(rpc, reverseKey);

  if (!reverseAccount.exists) {
    const ix_reverse = await createReverse({
      domainAddress,
      domain: "\0".concat(sub),
      payer: feePayer || owner,
      parentAddress,
      parentOwner: owner,
    });
    ixs.push(ix_reverse);
  }

  return ixs;
};
