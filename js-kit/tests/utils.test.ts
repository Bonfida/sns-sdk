import { describe, expect, jest, test } from "@jest/globals";
import { Address } from "@solana/kit";

import { Record } from "../src/types/record";
import { deserializeRecordContent } from "../src/utils/deserializers/deserializeRecordContent";
import { reverseLookup } from "../src/utils/reverseLookup";
import { reverseLookupBatch } from "../src/utils/reverseLookupBatch";
import { serializeRecordContent } from "../src/utils/serializers/serializeRecordContent";
import { RANDOM_ADDRESS, TEST_RPC } from "./constants";

jest.setTimeout(25_000);

describe("Utils methods", () => {
  // Reverse lookup cases
  const cases = [
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
    test("bulk reverse lookup completed correctly ", async () => {
      const domains = await reverseLookupBatch(
        TEST_RPC,
        cases.map((c) => c.address)
      );
      await expect(domains).toStrictEqual(cases.map((c) => c.primary));
    });
    test.each(cases)(
      "single reverse lookup for $address completed correctly ",
      async (e) => {
        const domain = await reverseLookup(TEST_RPC, e.address);
        await expect(domain).toBe(e.primary);
      }
    );
  });

  describe("reverseLookupBatch", () => {
    test("bulk reverse lookup completed correctly ", async () => {
      const domains = await reverseLookupBatch(
        TEST_RPC,
        cases.map((c) => c.address)
      );
      await expect(domains).toStrictEqual(cases.map((c) => c.primary));
    });
  });

  describe("serialize/deserializeRecordContent", () => {
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
    ])("$record record serialized/deserialized correctly", (e) => {
      const ser = serializeRecordContent(e.content, e.record);
      const des = deserializeRecordContent(ser, e.record);
      expect(des).toBe(e.content);
      if (e.length) {
        expect(ser.length).toBe(e.length);
      }
    });
  });
});
