import { describe, expect, jest, test } from "@jest/globals";
import { Address } from "@solana/kit";

import { getDomainsForAddress } from "../src/address/getDomainsForAddress";
import { getNftsForAddress } from "../src/address/getNftsForAddress";
import { getPrimaryDomain } from "../src/address/getPrimaryDomain";
import { getPrimaryDomainsBatch } from "../src/address/getPrimaryDomainsBatch";
import { RANDOM_ADDRESS, TEST_RPC } from "./constants";

jest.setTimeout(30_000);

describe("Address methods", () => {
  describe("getPrimaryDomain", () => {
    test.each([
      {
        user: "FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ" as Address,
        primary: {
          domainAddress:
            "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb" as Address,
          domainName: "bonfida",
          stale: true,
        },
      },
      {
        user: "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address,
        primary: {
          domainAddress:
            "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb" as Address,
          domainName: "bonfida",
          stale: false,
        },
      },
    ])("$user", async (e) => {
      const primary = await getPrimaryDomain(TEST_RPC, e.user);
      expect(primary.domainAddress).toBe(e.primary.domainAddress);
      expect(primary.domainName).toBe("bonfida");
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

  describe("getDomainsForAddress", () => {
    test.each([
      {
        address: RANDOM_ADDRESS,
        domains: [],
      },
      {
        address: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address,
        domains: [
          {
            domain: "wallet-guide-10",
            domainAddress: "9wcWEXmtUbmiAaWdhQ1nSaZ1cmDVdbYNbaeDcKoK5H8r",
          },
          {
            domain: "wallet-guide-3",
            domainAddress: "CZFQJkE2uBqdwHH53kBT6UStyfcbCWzh6WHwRRtaLgrm",
          },
          {
            domain: "wallet-guide-4",
            domainAddress: "ChkcdTKgyVsrLuD9zkUBoUkZ1GdZjTHEmgh5dhnR4haT",
          },
          {
            domain: "wallet-guide-6",
            domainAddress: "2NsGScxHd9bS6gA7tfY3xucCcg6H9qDqLdXLtAYFjCVR",
          },
          {
            domain: "wallet-guide-7",
            domainAddress: "6Yi9GyJKoFAv77pny4nxBqYYwFaAZ8dNPZX9HDXw5Ctw",
          },
          {
            domain: "wallet-guide-9",
            domainAddress: "8XXesVR1EEsCEePAEyXPL9A4dd9Bayhu9MRkFBpTkibS",
          },
        ],
      },
    ])("$address", async (item) => {
      const result = await getDomainsForAddress(TEST_RPC, item.address);
      result.sort((a, b) => a.domain.localeCompare(b.domain));
      expect(result).toStrictEqual(item.domains);
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
