import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

import {
  CENTRAL_STATE,
  NAME_PROGRAM_ID,
  PYTH_PULL_FEEDS,
  REFERRERS,
  REGISTER_PROGRAM_ID,
  ROOT_DOMAIN_ACCOUNT,
  USDC_MINT,
  VAULT_OWNER,
} from "../constants";
import { InvalidDomainError, PythFeedNotFoundError } from "../error";
import { createSplitV2Instruction } from "../instructions/createSplitV2Instruction";
import { getHashedNameSync } from "../utils/getHashedNameSync";
import { getNameAccountKeySync } from "../utils/getNameAccountKeySync";
import { getPythFeedAccountKey } from "../utils/getPythFeedAccountKey";

/**
 * This function can be used to register a .sol domain
 * @param connection The Solana RPC connection object
 * @param name The domain name to register e.g bonfida if you want to register bonfida.sol
 * @param space The domain name account size (max 10kB)
 * @param buyer The public key of the buyer
 * @param buyerTokenAccount The buyer token account (USDC)
 * @param mint Optional mint used to purchase the domain, defaults to USDC
 * @param referrerKey Optional referrer key
 * @returns
 */
export const registerDomainNameV2 = async (
  connection: Connection,
  name: string,
  space: number,
  buyer: Address,
  buyerTokenAccount: Address,
  mint = USDC_MINT,
  referrerKey?: Address
) => {
  // Basic validation
  if (name.includes(".") || name.trim().toLowerCase() !== name) {
    throw new InvalidDomainError("The domain name is malformed");
  }

  const hashed = getHashedNameSync(name);
  const nameAccount = getNameAccountKeySync(
    hashed,
    undefined,
    ROOT_DOMAIN_ACCOUNT
  );

  const hashedReverseLookup = getHashedNameSync(nameAccount.toBase58());
  const reverseLookupAccount = getNameAccountKeySync(
    hashedReverseLookup,
    CENTRAL_STATE
  );

  const [derived_state] = PublicKey.findProgramAddressSync(
    [nameAccount.toBuffer()],
    REGISTER_PROGRAM_ID
  );

  const refIdx = REFERRERS.findIndex((e) => referrerKey?.equals(e));
  let refTokenAccount: PublicKey | undefined = undefined;

  const ixs: TransactionInstruction[] = [];

  if (refIdx !== -1 && !!referrerKey) {
    refTokenAccount = getAssociatedTokenAddressSync(mint, referrerKey, true);
    const acc = await connection.getAccountInfo(refTokenAccount);
    if (!acc?.data) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        buyer,
        refTokenAccount,
        referrerKey,
        mint
      );
      ixs.push(ix);
    }
  }

  const vault = getAssociatedTokenAddressSync(mint, VAULT_OWNER, true);
  const pythFeed = PYTH_PULL_FEEDS.get(mint.toBase58());

  if (!pythFeed) {
    throw new PythFeedNotFoundError(
      "The Pyth account for the provided mint was not found"
    );
  }

  const [pythFeedAccount] = getPythFeedAccountKey(0, pythFeed);

  const ix = new createSplitV2Instruction({
    name,
    space,
    referrerIdxOpt: refIdx != -1 ? refIdx : null,
  }).getInstruction(
    REGISTER_PROGRAM_ID,
    NAME_PROGRAM_ID,
    ROOT_DOMAIN_ACCOUNT,
    nameAccount,
    reverseLookupAccount,
    SystemProgram.programId,
    CENTRAL_STATE,
    buyer,
    buyer,
    buyer,
    buyerTokenAccount,
    pythFeedAccount,
    vault,
    TOKEN_PROGRAM_ID,
    SYSVAR_RENT_PUBKEY,
    derived_state,
    refTokenAccount
  );
  ixs.push(ix);

  return ixs;
};
