import { getProgramDerivedAddress } from "@solana/kit";

import { PYTH_PROGRAM_ID } from "../constants/pythFeeds";

interface GetPythFeedAddressParams {
  shard: number;
  priceFeed: number[];
}

/**
 * Retrieves the address of the Pyth feed for a specific shard and price feed.
 *
 * @param params - An object containing the following properties:
 *   - `shard`: The shard number associated with the Pyth feed.
 *   - `priceFeed`: An array representing the price feed data.
 * @returns A promise that resolves to the Pyth feed address.
 */
export const getPythFeedAddress = async ({
  shard,
  priceFeed,
}: GetPythFeedAddressParams) => {
  const uint8Array = new Uint8Array(2);
  const view = new DataView(uint8Array.buffer);
  view.setUint16(0, shard, true);

  const [pda] = await getProgramDerivedAddress({
    programAddress: PYTH_PROGRAM_ID,
    seeds: [uint8Array, Uint8Array.from(priceFeed)],
  });

  return pda;
};
