import { Address, IInstruction, getProgramDerivedAddress } from "@solana/kit";

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

interface BurnDomainParams {
  domain: string;
  owner: Address;
  refundAddress: Address;
}

/**
 * Generates an instruction to burn a domain.
 *
 * @param params - An object containing the following properties:
 *   - `domain`: The domain name to be burned.
 *   - `owner`: The address of the current owner of the domain.
 *   - `refundAddress`: The address to which rent will be refunded.
 * @returns A promise which resolves to the burn domain instruction.
 */
export const burnDomain = async ({
  domain,
  owner,
  refundAddress,
}: BurnDomainParams): Promise<IInstruction> => {
  const { domainAddress } = await getDomainAddress({ domain });
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
    refundAddress
  );

  return ix;
};
