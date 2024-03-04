require("dotenv").config();
import { test, jest } from "@jest/globals";
import { PublicKey, Connection } from "@solana/web3.js";
import { getDomainKeySync, getTokenizedDomains } from "../src/utils";
import { getDomainMint } from "../src/nft/name-tokenizer";

jest.setTimeout(10_000);
const connection = new Connection(process.env.RPC_URL!);

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
  domains.sort((a, b) => b.reverse!.localeCompare(a.reverse!));
  for (let item of items) {
    expect(domains).toEqual(item.domains);
  }
});

describe("getDomainMint", () => {
  test.each([
    {
      domain: "domain1.sol",
      address: "3YTxXhhVue9BVjgjPwJbbJ4uGPsnwN453DDf72rYE5WN",
    },
    {
      domain: "sub.domain2.sol",
      address: "66CnogoXDBqYeYRGYzQf19VyrMnB4uGxpZQDuDYfbKCX",
    },
  ])("$domain", (e) => {
    expect(getDomainMint(getDomainKeySync(e.domain).pubkey).toBase58()).toBe(
      e.address,
    );
  });
});
