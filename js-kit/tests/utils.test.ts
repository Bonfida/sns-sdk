import { describe, expect, jest, test } from "@jest/globals";
import { Address } from "@solana/kit";

import { Record } from "../src/types/record";
import { deserializeRecordContent } from "../src/utils/deserializers/deserializeRecordContent";
import { getPythFeedAddress } from "../src/utils/getPythFeedAddress";
import { reverseLookup } from "../src/utils/reverseLookup";
import { reverseLookupBatch } from "../src/utils/reverseLookupBatch";
import { serializeRecordContent } from "../src/utils/serializers/serializeRecordContent";
import { RANDOM_ADDRESS, TEST_RPC } from "./constants";

jest.setTimeout(5_000);

describe("Utils methods", () => {
  const addresses = [
    {
      address: "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb" as Address,
      primary: "bonfida",
    },
    {
      address: "6WWS69JbYTnQZ1WyGVsJsBAB35iaszgy9KqCANJfmQr8" as Address,
      primary: "wallet-guide-1",
    },
    {
      address: "5GUXAsmcn4pHzJyNFTxe6m9HQAmWE1eCmPL6RJoh3tcZ" as Address,
      primary: "wallet-guide-2",
    },
  ];

  describe("reverseLookup", () => {
    test.each(addresses)("$address", async (e) => {
      const domain = await reverseLookup({
        rpc: TEST_RPC,
        domainAddress: e.address,
      });
      await expect(domain).toBe(e.primary);
    });
  });

  describe("reverseLookupBatch", () => {
    test("[3 addresses]", async () => {
      const domains = await reverseLookupBatch({
        rpc: TEST_RPC,
        domainAddresses: addresses.map((c) => c.address),
      });
      await expect(domains).toStrictEqual(addresses.map((c) => c.primary));
    });
  });

  describe("serializeRecord/deserializeRecord", () => {
    test.each([
      { content: "this is a test", record: Record.TXT },
      {
        content: RANDOM_ADDRESS,
        record: Record.SOL,
        length: 32,
      },
      {
        content: "inj13glcnaum2xqv5a0n0hdsmv0f6nfacjsfvrh5j9",
        record: Record.Injective,
        length: 20,
      },
      {
        content: "example.com",
        record: Record.CNAME,
      },
      {
        content: "0xc0ffee254729296a45a3885639ac7e10f9d54979",
        record: Record.ETH,
        length: 20,
      },
      {
        content: "1.1.1.4",
        record: Record.A,
        length: 4,
      },
      {
        content: "2345:425:2ca1::567:5673:23b5",
        record: Record.AAAA,
        length: 16,
      },
      {
        content: "username",
        record: Record.Discord,
      },
      {
        content:
          "k51qzi5uqu5dlvj2baxnqndepeb86cbk3ng7n3i46uzyxzyqj2xjonzllnv0v8",
        record: Record.IPNS,
      },
    ])("$record", (e) => {
      const ser = serializeRecordContent({
        content: e.content,
        record: e.record,
      });
      const des = deserializeRecordContent({ content: ser, record: e.record });
      expect(des).toBe(e.content);
      if (e.length) {
        expect(ser.length).toBe(e.length);
      }
    });
  });

  describe("getPythFeedAddress", () => {
    test.each([
      {
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        priceFeed: [
          234, 160, 32, 198, 28, 196, 121, 113, 40, 19, 70, 28, 225, 83, 137,
          74, 150, 166, 192, 11, 33, 237, 12, 252, 39, 152, 209, 249, 169, 233,
          201, 74,
        ],
        feedAddress: "Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX",
      },
      {
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        priceFeed: [
          43, 137, 185, 220, 143, 223, 159, 52, 112, 154, 91, 16, 107, 71, 47,
          15, 57, 187, 108, 169, 206, 4, 176, 253, 127, 46, 151, 22, 136, 226,
          229, 59,
        ],
        feedAddress: "HT2PLQBcG5EiCcNSaMHAjSgd9F98ecpATbk4Sk5oYuM",
      },
      {
        mint: "So11111111111111111111111111111111111111112",
        priceFeed: [
          239, 13, 139, 111, 218, 44, 235, 164, 29, 161, 93, 64, 149, 209, 218,
          57, 42, 13, 47, 142, 208, 198, 199, 188, 15, 76, 250, 200, 194, 128,
          181, 109,
        ],
        feedAddress: "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE",
      },
    ])("$mint", async ({ priceFeed, feedAddress }) => {
      const res = await getPythFeedAddress({ shard: 0, priceFeed });
      expect(res).toBe(feedAddress);
    });
  });
});
