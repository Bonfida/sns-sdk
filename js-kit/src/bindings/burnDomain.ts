import { Address, getProgramDerivedAddress } from "@solana/kit";

import { addressCodec } from "../codecs";
import {
  NAME_PROGRAM_ADDRESS,
  REGISTRY_PROGRAM_ADDRESS,
  REVERSE_LOOKUP_CLASS,
  SYSTEM_PROGRAM_ADDRESS,
} from "../constants/addresses";
import { getDomainAddress } from "../domain/getDomainAddress";
import { burnDomainInstruction } from "../instructions/burnDomainInstruction";
import { getReverseAddress } from "../utils/getReverseAddress";

export const burnDomain = async (
  domain: string,
  owner: Address,
  target: Address
) => {
  const { address: domainAddress } = await getDomainAddress(domain);
  const encoded = addressCodec.encode(domainAddress);

  const [pda] = await getProgramDerivedAddress({
    programAddress: REGISTRY_PROGRAM_ADDRESS,
    seeds: [encoded],
  });

  const [resellingPda] = await getProgramDerivedAddress({
    programAddress: REGISTRY_PROGRAM_ADDRESS,
    seeds: [encoded, Uint8Array.from([1, 1])],
  });

  const reverseAddress = await getReverseAddress(domain);

  const ix = new burnDomainInstruction().getInstruction(
    REGISTRY_PROGRAM_ADDRESS,
    NAME_PROGRAM_ADDRESS,
    SYSTEM_PROGRAM_ADDRESS,
    domainAddress,
    reverseAddress,
    resellingPda,
    pda,
    REVERSE_LOOKUP_CLASS,
    owner,
    target
  );

  return ix;
};
