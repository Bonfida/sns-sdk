import { GetProgramAccountsApi, Rpc } from "@solana/kit";

import { base58Codec } from "../codecs";
import {
  NAME_PROGRAM_ADDRESS,
  REVERSE_LOOKUP_CLASS,
} from "../constants/addresses";
import { deserializeReverse } from "../utils/deserializers/deserializeReverse";
import { getReverseAddressFromDomainAddress } from "../utils/getReverseAddressFromDomainAddress";
import { getDomainAddress } from "./getDomainAddress";

export const getSubdomains = async (
  rpc: Rpc<GetProgramAccountsApi>,
  domain: string
): Promise<string[]> => {
  const { address, isSub } = await getDomainAddress(domain);

  if (isSub) return [];

  const getReversesAsync = rpc
    .getProgramAccounts(NAME_PROGRAM_ADDRESS, {
      encoding: "base58",
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: address,
            encoding: "base58",
          },
        },
        {
          memcmp: {
            offset: 64n,
            bytes: REVERSE_LOOKUP_CLASS,
            encoding: "base58",
          },
        },
      ],
    })
    .send();

  const getSubsAsync = await rpc
    .getProgramAccounts(NAME_PROGRAM_ADDRESS, {
      encoding: "base58",
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: address,
            encoding: "base58",
          },
        },
      ],
      dataSlice: { offset: 0, length: 0 },
    })
    .send();

  const [reverses, subs] = await Promise.all([getReversesAsync, getSubsAsync]);

  const map = new Map<string, string | undefined>(
    reverses.map((e) => [
      e.pubkey,
      deserializeReverse(base58Codec.encode(e.account.data[0]).slice(96), true),
    ])
  );

  const result = await Promise.all(
    subs.map((sub) =>
      getReverseAddressFromDomainAddress(sub.pubkey, address).then((revKey) =>
        map.get(revKey)
      )
    )
  );

  const filteredResult = result.filter((sub) => sub !== undefined);

  return filteredResult;
};
