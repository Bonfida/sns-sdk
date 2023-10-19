import { test, expect, jest } from "@jest/globals";
import { getDomainKeysWithReverses } from "../src/utils";
import { PublicKey, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const item = {
  user: new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8"),
  pubKey: [
    "CZFQJkE2uBqdwHH53kBT6UStyfcbCWzh6WHwRRtaLgrm",
    "ChkcdTKgyVsrLuD9zkUBoUkZ1GdZjTHEmgh5dhnR4haT",
  ],
  domain: ["wallet-guide-3", "wallet-guide-4"],
};

const connection = new Connection("https://rpc-public.hellomoon.io");

test("Get reversed domains", async () => {
  const domains = await getDomainKeysWithReverses(connection, item.user);
  domains.sort();

  for (let i = 0; i < domains.length; i++) {
    expect(domains[i].domain).toEqual(item.domain[i]);
    expect(domains[i].pubKey.toBase58()).toEqual(item.pubKey[i]);
  }
});
