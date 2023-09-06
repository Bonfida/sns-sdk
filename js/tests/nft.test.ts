import { test, jest } from "@jest/globals";
import { PublicKey, Connection } from "@solana/web3.js";
import { getTokenizedDomains } from "../src/nft";

jest.setTimeout(10_000);
const connection = new Connection("https://rpc-public.hellomoon.io");

const items = [
  {
    owner: new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8"),
    domains: [
      {
        key: "iSNVgWfb31aTWa58UxZ6fp7n3TTrUk5Gojggub5stXk",
        mint: "2RJhBbxTiPT2bZq5bhjaTZbsnhbDB7VtTAMmCdBrwBZP",
        reverse: "wallet-guide-5",
      },
      {
        key: "uDTBDfKrJSBTgmWUZLcENPk5YrHfWbcrUbNFLjsvNpn",
        mint: "Eskv5Ns4gyREvNPPgANojNPsz6x1cbn9YwT7esAnxPhP",
        reverse: "wallet-guide-0",
      },
    ],
  },
];

test("Get tokenized domains", async () => {
  const domains = (
    await getTokenizedDomains(
      connection,
      new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8")
    )
  ).map((e) => {
    return {
      key: e.key.toBase58(),
      mint: e.mint.toBase58(),
      reverse: e.reverse,
    };
  });
  domains.sort();

  for (let item of items) {
    expect(domains).toEqual(item.domains);
  }
});
