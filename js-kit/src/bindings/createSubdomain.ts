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

  const a = await getDomainAddress(subdomain);
  console.log(a);

  const [{ address, parentAddress }, lamports] = await Promise.all([
    getDomainAddress(subdomain),
    rpc
      .getMinimumBalanceForRentExemption(
        BigInt(space + RegistryState.HEADER_LEN)
      )
      .send(),
  ]);

  console.log({ address, parentAddress });

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
