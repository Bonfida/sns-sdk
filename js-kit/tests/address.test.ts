import { describe, expect, jest, test } from "@jest/globals";
import { Address } from "@solana/kit";

import { getNftsForAddress } from "../src/address/getNftsForAddress";
import { getPrimaryDomain } from "../src/address/getPrimaryDomain";
import { getPrimaryDomainsBatch } from "../src/address/getPrimaryDomainsBatch";
import { RANDOM_ADDRESS, TEST_RPC } from "./constants";

jest.setTimeout(5_000);

describe("Address methods", () => {
  describe("getPrimaryDomain", () => {
    test.each([
      {
        user: "FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ" as Address,
        primary: {
          domain: "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb" as Address,
          reverse: "bonfida",
          stale: true,
        },
      },
      {
        user: "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address,
        primary: {
          domain: "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb" as Address,
          reverse: "bonfida",
          stale: false,
        },
      },
    ])("$user", async (e) => {
      const primary = await getPrimaryDomain(TEST_RPC, e.user);
      expect(primary.domain).toBe(e.primary.domain);
      expect(primary.reverse).toBe("bonfida");
      expect(primary.stale).toBe(e.primary.stale);
    });
  });

  describe("getPrimaryDomainBatch", () => {
    test("[4 Addresses]", async () => {
      const items = [
        // Random pubkey
        {
          address: RANDOM_ADDRESS,
        },
        // Non tokenized
        {
          address: "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address,
          domain: "bonfida",
        },
        // Stale non tokenized
        {
          address: "FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ" as Address,
          domain: undefined,
        },
        // Tokenized
        {
          address: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4" as Address,
          domain: "fav-tokenized",
        },
      ];

      const result = await getPrimaryDomainsBatch(
        TEST_RPC,
        items.map((item) => item.address)
      );
      expect(result).toStrictEqual(items.map((item) => item.domain));
    });
  });

  describe("getNftsForAddress", () => {
    test.each([
      {
        address: RANDOM_ADDRESS,
        nfts: [],
      },
      {
        address: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs" as Address,
        nfts: [
          {
            domain: "sns-ip-5-wallet-1",
            domainAddress: "6qJtQdAJvAiSfGXWAuHDteAes6vnFcxtHmLzw1TStCrd",
            mint: "8dJNBsnM5Zo8RUy94Y9Te1EJa77NXG1T556zpMp8UYnv",
          },
        ],
      },
    ])("$address", async (item) => {
      const result = await getNftsForAddress(TEST_RPC, item.address);
      expect(result).toStrictEqual(item.nfts);
    });
  });
});
