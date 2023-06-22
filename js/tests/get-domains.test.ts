import { test, expect, jest } from "@jest/globals";
import { getAllDomains } from "../src/utils";
import { PublicKey, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const items = [
  {
    user: new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8"),
    domain: [
      "CZFQJkE2uBqdwHH53kBT6UStyfcbCWzh6WHwRRtaLgrm",
      "ChkcdTKgyVsrLuD9zkUBoUkZ1GdZjTHEmgh5dhnR4haT",
    ],
  },
];

const connection = new Connection("https://rpc-public.hellomoon.io");

test("Get domains", async () => {
  for (let item of items) {
    const domains = (await getAllDomains(connection, item.user)).map((e) =>
      e.toBase58()
    );
    domains.sort();
    expect(domains).toEqual(item.domain);
  }
});
