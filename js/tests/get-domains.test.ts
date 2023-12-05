require("dotenv").config();
import { test, expect, jest } from "@jest/globals";
import { getAllDomains } from "../src/utils";
import { PublicKey, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const items = [
  {
    user: new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8"),
    domain: [
      "2NsGScxHd9bS6gA7tfY3xucCcg6H9qDqLdXLtAYFjCVR",
      "6Yi9GyJKoFAv77pny4nxBqYYwFaAZ8dNPZX9HDXw5Ctw",
      "8XXesVR1EEsCEePAEyXPL9A4dd9Bayhu9MRkFBpTkibS",
      "9wcWEXmtUbmiAaWdhQ1nSaZ1cmDVdbYNbaeDcKoK5H8r",
      "CZFQJkE2uBqdwHH53kBT6UStyfcbCWzh6WHwRRtaLgrm",
      "ChkcdTKgyVsrLuD9zkUBoUkZ1GdZjTHEmgh5dhnR4haT",
    ],
  },
];

const connection = new Connection(process.env.RPC_URL!);

test("Get domains", async () => {
  for (let item of items) {
    const domains = (await getAllDomains(connection, item.user)).map((e) =>
      e.toBase58()
    );
    domains.sort();
    expect(domains).toEqual(item.domain);
  }
});
