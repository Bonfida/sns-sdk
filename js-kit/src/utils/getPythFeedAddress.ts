import { getProgramDerivedAddress } from "@solana/kit";

import { PYTH_PROGRAM_ID } from "../constants/pyth_feeds";

export const getPythFeedAddress = (shard: number, priceFeed: number[]) => {
  const uint8Array = new Uint8Array(2);
  const view = new DataView(uint8Array.buffer);
  view.setUint16(0, shard, true);

  return getProgramDerivedAddress({
    programAddress: PYTH_PROGRAM_ID,
    seeds: [uint8Array, Uint8Array.from(priceFeed)],
  });
};
