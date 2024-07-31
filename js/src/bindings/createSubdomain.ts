import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { NameRegistryState } from "../state";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { getReverseKeySync } from "../utils/getReverseKeySync";
import { InvalidDomainError } from "../error";

import { createNameRegistry } from "./createNameRegistry";
import { createReverseName } from "./createReverseName";

/**
 * This function can be used to create a subdomain
 * @param connection The Solana RPC connection object
 * @param subdomain The subdomain to create with or without .sol e.g something.bonfida.sol or something.bonfida
 * @param owner The owner of the parent domain creating the subdomain
 * @param space The space to allocate to the subdomain (defaults to 2kb)
 * @param feePayer Optional: Specifies a fee payer different from the parent owner
 */
export const createSubdomain = async (
  connection: Connection,
  subdomain: string,
  owner: PublicKey,
  space = 2_000,
  feePayer?: PublicKey,
) => {
  const ixs: TransactionInstruction[] = [];
  const sub = subdomain.split(".")[0];
  if (!sub) {
    throw new InvalidDomainError("The subdomain name is malformed");
  }

  const { parent, pubkey } = getDomainKeySync(subdomain);

  // Space allocated to the subdomains
  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
  );

  const ix_create = await createNameRegistry(
    connection,
    "\0".concat(sub),
    space, // Hardcode space to 2kB
    feePayer || owner,
    owner,
    lamports,
    undefined,
    parent,
  );
  ixs.push(ix_create);

  // Create the reverse name
  const reverseKey = getReverseKeySync(subdomain, true);
  const info = await connection.getAccountInfo(reverseKey);
  if (!info?.data) {
    const ix_reverse = await createReverseName(
      pubkey,
      "\0".concat(sub),
      feePayer || owner,
      parent,
      owner,
    );
    ixs.push(...ix_reverse);
  }

  return ixs;
};
