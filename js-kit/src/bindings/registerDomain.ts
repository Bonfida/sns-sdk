import {
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
} from "@solana-program/token";
import {
  Address,
  GetAccountInfoApi,
  IInstruction,
  Rpc,
  fetchEncodedAccount,
  getProgramDerivedAddress,
} from "@solana/kit";

import { addressCodec } from "../codecs";
import {
  CENTRAL_STATE,
  NAME_PROGRAM_ADDRESS,
  REFERRERS,
  REGISTRY_PROGRAM_ADDRESS,
  ROOT_DOMAIN_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
  SYSVAR_RENT_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
  USDC_MINT,
  VAULT_OWNER,
} from "../constants/addresses";
import { PYTH_FEEDS } from "../constants/pyth_feeds";
import { InvalidDomainError, PythFeedNotFoundError } from "../errors";
import { _createAtaInstruction } from "../instructions/createAtaInstruction";
import { createSplitV2Instruction } from "../instructions/createSplitV2Instruction";
import { deriveAddress } from "../utils/deriveAddress";
import { getPythFeedAddress } from "../utils/getPythFeedAddress";

export const registerDomainNameV2 = async (
  rpc: Rpc<GetAccountInfoApi>,
  domain: string,
  space: number,
  buyer: Address,
  buyerTokenAccount: Address,
  mint = USDC_MINT,
  referrer?: Address
) => {
  // Basic validation
  if (domain.includes(".") || domain.trim().toLowerCase() !== domain) {
    throw new InvalidDomainError("The domain name is malformed");
  }

  const domainAddress = await deriveAddress(domain, ROOT_DOMAIN_ADDRESS);

  const reverseLookupAccount = await deriveAddress(
    domainAddress,
    undefined,
    CENTRAL_STATE
  );

  const [stateAddress] = await getProgramDerivedAddress({
    programAddress: REGISTRY_PROGRAM_ADDRESS,
    seeds: [addressCodec.encode(domainAddress)],
  });

  const ixs: IInstruction[] = [];
  const referrerIndex = REFERRERS.findIndex((e) => e === referrer);
  const validReferrer = referrer && referrerIndex !== -1;
  let ata: Address | undefined = undefined;

  if (validReferrer) {
    [ata] = await findAssociatedTokenPda({
      mint,
      owner: referrer,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    const ataAccount = await fetchEncodedAccount(rpc, ata);

    if (!ataAccount.exists) {
      const ix = _createAtaInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
        buyer,
        ata,
        referrer,
        mint,
        SYSTEM_PROGRAM_ADDRESS,
        TOKEN_PROGRAM_ADDRESS
      );

      ixs.push(ix);
    }
  }

  const [vaultAta] = await findAssociatedTokenPda({
    mint,
    owner: VAULT_OWNER,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  const pythFeed = PYTH_FEEDS.get(mint);

  if (!pythFeed) {
    throw new PythFeedNotFoundError(
      "The Pyth account for the provided mint was not found"
    );
  }

  const pythFeedAddress = await getPythFeedAddress(0, pythFeed);

  const ix = new createSplitV2Instruction({
    name: domain,
    space,
    referrerIdxOpt: validReferrer ? referrerIndex : null,
  }).getInstruction(
    REGISTRY_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    ROOT_DOMAIN_ADDRESS,
    domainAddress,
    reverseLookupAccount,
    SYSTEM_PROGRAM_ADDRESS,
    CENTRAL_STATE,
    buyer,
    buyer,
    buyer,
    buyerTokenAccount,
    pythFeedAddress,
    vaultAta,
    TOKEN_PROGRAM_ADDRESS,
    SYSVAR_RENT_ADDRESS,
    stateAddress,
    ata
  );
  ixs.push(ix);

  return ixs;
};
