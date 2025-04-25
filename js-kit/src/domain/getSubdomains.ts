import { Address, GetProgramAccountsApi, Rpc } from "@solana/kit";

import { addressCodec, base58Codec } from "../codecs";
import {
  NAME_PROGRAM_ADDRESS,
  REVERSE_LOOKUP_CLASS,
} from "../constants/addresses";
import { deserializeReverse } from "../utils/deserializers/deserializeReverse";
import { getReverseAddressFromDomainAddress } from "../utils/getReverseAddressFromDomainAddress";
import { getDomainAddress } from "./getDomainAddress";

interface GetSubdomainsParams {
  rpc: Rpc<GetProgramAccountsApi>;
  domain: string;
}

interface Result {
  subdomain: string;
  owner: Address;
}

/**
 * Retrieves all subdomains under the specified domain, including their owners.
 *
 * @param params - An object containing the following properties:
 *   - `rpc`: An RPC interface implementing GetProgramAccountsApi.
 *   - `domain`: The domain whose subdomains are to be retrieved.
 * @returns A promise that resolves to an array of subdomain objects, each containing the subdomain name and owner address.
 */
export const getSubdomains = async ({
  rpc,
  domain,
}: GetSubdomainsParams): Promise<Result[]> => {
  const { domainAddress, isSub } = await getDomainAddress({ domain });

  if (isSub) return [];

  const getReversesAsync = rpc
    .getProgramAccounts(NAME_PROGRAM_ADDRESS, {
      encoding: "base58",
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: domainAddress,
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
            bytes: domainAddress,
            encoding: "base58",
          },
        },
      ],
      dataSlice: { offset: 32, length: 32 },
    })
    .send();

  const [reverses, subs] = await Promise.all([getReversesAsync, getSubsAsync]);

  const map = new Map<string, string | undefined>(
    reverses.map((e) => [
      e.pubkey,
      deserializeReverse({
        data: base58Codec.encode(e.account.data[0]).slice(96),
        trimFirstNullByte: true,
      }),
    ])
  );

  const result = await Promise.all(
    subs.map((sub) =>
      getReverseAddressFromDomainAddress({
        domainAddress: sub.pubkey,
        parentAddress: domainAddress,
      }).then((revKey) => {
        const subdomain = map.get(revKey);
        return subdomain
          ? {
              subdomain,
              owner: addressCodec.decode(
                base58Codec.encode(sub.account.data[0])
              ),
            }
          : undefined;
      })
    )
  );

  const filteredResult = result.filter((sub) => sub !== undefined);

  return filteredResult;
};
