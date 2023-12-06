require("dotenv").config();
import { test, expect, jest } from "@jest/globals";
import { getDomainKeysWithReverses } from "../src/utils";
import { PublicKey, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const item = {
  user: new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8"),
  pubKey: [
    "9wcWEXmtUbmiAaWdhQ1nSaZ1cmDVdbYNbaeDcKoK5H8r",
    "CZFQJkE2uBqdwHH53kBT6UStyfcbCWzh6WHwRRtaLgrm",
    "ChkcdTKgyVsrLuD9zkUBoUkZ1GdZjTHEmgh5dhnR4haT",
    "2NsGScxHd9bS6gA7tfY3xucCcg6H9qDqLdXLtAYFjCVR",
    "6Yi9GyJKoFAv77pny4nxBqYYwFaAZ8dNPZX9HDXw5Ctw",
    "8XXesVR1EEsCEePAEyXPL9A4dd9Bayhu9MRkFBpTkibS",
  ],
  domain: [
    "wallet-guide-10",
    "wallet-guide-3",
    "wallet-guide-4",
    "wallet-guide-6",
    "wallet-guide-7",
    "wallet-guide-9",
  ],
};

const connection = new Connection(process.env.RPC_URL!);

test("Get reversed domains", async () => {
  const domains = await getDomainKeysWithReverses(connection, item.user);
  domains.sort((a, b) => a.domain!.localeCompare(b.domain!));

  for (let i = 0; i < domains.length; i++) {
    expect(domains[i].domain).toEqual(item.domain[i]);
    expect(domains[i].pubKey.toBase58()).toEqual(item.pubKey[i]);
  }
});
