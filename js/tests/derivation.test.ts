import { test, expect } from "@jest/globals";
import { getDomainKey } from "../src/deprecated/utils";
import { getDomainKeySync } from "../src/utils";

const items = [
  {
    domain: "bonfida",
    address: "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb",
  },
  {
    domain: "bonfida.sol",
    address: "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb",
  },
  {
    domain: "dex.bonfida",
    address: "HoFfFXqFHAC8RP3duuQNzag1ieUwJRBv1HtRNiWFq4Qu",
  },
  {
    domain: "dex.bonfida.sol",
    address: "HoFfFXqFHAC8RP3duuQNzag1ieUwJRBv1HtRNiWFq4Qu",
  },
];

test("Derivation", async () => {
  for (let item of items) {
    const { pubkey } = await getDomainKey(item.domain);
    expect(pubkey.toBase58()).toBe(item.address);
  }
  items.forEach((e) =>
    expect(getDomainKeySync(e.domain).pubkey.toBase58()).toBe(e.address)
  );
});
