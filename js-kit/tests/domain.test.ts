import { describe, expect, jest, test } from "@jest/globals";

import { SYSTEM_PROGRAM_ADDRESS } from "../src/constants/addresses";
import { getAllDomains } from "../src/domain/getAllDomains";
import { getDomainAddress } from "../src/domain/getDomainAddress";
import { getDomainOwner } from "../src/domain/getDomainOwner";
import { getDomainRecord } from "../src/domain/getDomainRecord";
import { getDomainRecords } from "../src/domain/getDomainRecords";
import { getSubdomains } from "../src/domain/getSubdomains";
import { AllowPda, resolveDomain } from "../src/domain/resolveDomain";
import {
  InvalidRoAError,
  InvalidValidationError,
  MissingVerifierError,
  NoRecordDataError,
  PdaOwnerNotAllowedError,
} from "../src/errors";
import { Record } from "../src/types/record";
import { TEST_RPC } from "./constants";

jest.setTimeout(60_000);

describe("Domain methods", () => {
  describe("getDomainAddress", () => {
    test.each([
      {
        domain: "sns-ip-5-wallet-1",
        address: "6qJtQdAJvAiSfGXWAuHDteAes6vnFcxtHmLzw1TStCrd",
      },
      {
        domain: "sns-ip-5-wallet-1.sol",
        address: "6qJtQdAJvAiSfGXWAuHDteAes6vnFcxtHmLzw1TStCrd",
      },
      {
        domain: "test.sns-ip-5-wallet-1",
        address: "EzQAeEBXpZWpsZXcZRwV63RRr2RkwBVqdYN53tcbTDEm",
      },
      {
        domain: "test.sns-ip-5-wallet-1.sol",
        address: "EzQAeEBXpZWpsZXcZRwV63RRr2RkwBVqdYN53tcbTDEm",
      },
    ])("$domain", async (item) => {
      const { address } = await getDomainAddress(item.domain);
      expect(address).toBe(item.address);
    });
  });

  describe("getDomainOwner", () => {
    test.each([
      {
        domain: "sns-ip-5-wallet-1",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-2",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-3",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-4",
        owner: "7PLHHJawDoa4PGJUK3mUnusV7SEVwZwEyV5csVzm86J4",
      },
      {
        domain: "sns-ip-5-wallet-5",
        owner: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
      },
      {
        domain: "sns-ip-5-wallet-6",
        owner: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
      },
      {
        domain: "sns-ip-5-wallet-7",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-8",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-9",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-10",
        owner: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
      },
      {
        domain: "sns-ip-5-wallet-11",
        owner: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
      },
      {
        domain: "sns-ip-5-wallet-12",
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
    ])("$domain", async (item) => {
      const res = await getDomainOwner(TEST_RPC, item.domain);
      expect(res).toBe(item.owner);
    });
  });

  describe("getDomainRecord", () => {
    test.each([
      {
        domain: "wallet-guide-9.sol",
        record: Record.IPFS,
        value: "ipfs://test",
        verified: { staleness: true },
      },
      {
        domain: "wallet-guide-9.sol",
        record: Record.BTC,
        error: new NoRecordDataError("Record account not found"),
      },
      {
        domain: "wallet-guide-9.sol",
        record: Record.Email,
        value: "test@gmail.com",
        verified: { staleness: false },
      },
      {
        domain: "wallet-guide-9.sol",
        record: Record.Url,
        value: "https://google.com",
        verified: { staleness: false, rightOfAssociation: false },
      },
      {
        domain: "wallet-guide-9.sol",
        record: Record.ETH,
        error: new NoRecordDataError("Record account not found"),
      },
    ])("$domain $record", async (item) => {
      if (item.value) {
        const res = await getDomainRecord(TEST_RPC, item.domain, item.record, {
          deserialize: true,
        });
        expect(res.deserializedContent).toBe(item.value);
        expect(res.verified).toStrictEqual(item.verified);
      } else {
        await expect(
          getDomainRecord(TEST_RPC, item.domain, item.record, {
            deserialize: true,
          })
        ).rejects.toThrow(item.error);
      }
    });
  });

  describe("getDomainRecords", () => {
    test("wallet-guide-9.sol [5 records]", async () => {
      const domain = "wallet-guide-9.sol";
      const records = [
        {
          record: Record.IPFS,
          value: "ipfs://test",
          verified: { staleness: true },
        },
        {
          record: Record.BTC,
        },
        {
          record: Record.Email,
          value: "test@gmail.com",
          verified: { staleness: false },
        },
        {
          record: Record.Url,
          value: "https://google.com",
          verified: { staleness: false, rightOfAssociation: false },
        },
        {
          record: Record.ETH,
        },
      ];

      const res = await getDomainRecords(
        TEST_RPC,
        domain,
        records.map((item) => item.record),
        {
          deserialize: true,
          verifiers: records.map(() => undefined),
        }
      );
      records.forEach((record, idx) => {
        if (record.value) {
          expect(res[idx]?.deserializedContent).toBe(record.value);
          expect(res[idx]?.verified).toStrictEqual(record.verified);
        } else {
          expect(res[idx]).toBe(undefined);
        }
      });

      await expect(
        getDomainRecords(
          TEST_RPC,
          domain,
          records.map((item) => item.record),
          {
            deserialize: true,
            verifiers: [],
          }
        )
      ).rejects.toThrow(
        new MissingVerifierError(
          "The number of verifiers must be the same as the number of records"
        )
      );
    });
  });

  describe("getSubdomains", () => {
    test("wallet-guide-9.sol", async () => {
      const domain = "wallet-guide-9.sol";
      const subs = await getSubdomains(TEST_RPC, domain);
      expect(subs).toStrictEqual([
        {
          subdomain: "sub-0",
          owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
        },
      ]);
    });
  });

  describe("resolveDomain", () => {
    test.each([
      {
        domain: "sns-ip-5-wallet-1",
        result: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-2",
        result: "AxwzQXhZNJb9zLyiHUQA12L2GL7CxvUNrp6neee6r3cA",
      },
      {
        domain: "sns-ip-5-wallet-4",
        result: "7PLHHJawDoa4PGJUK3mUnusV7SEVwZwEyV5csVzm86J4",
      },
      {
        domain: "sns-ip-5-wallet-5",
        result: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
        config: { allowPda: true, programIds: [SYSTEM_PROGRAM_ADDRESS] },
      },
      {
        domain: "sns-ip-5-wallet-5",
        result: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
        config: { allowPda: "any" as AllowPda },
      },
      {
        domain: "sns-ip-5-wallet-7",
        result: "53Ujp7go6CETvC7LTyxBuyopp5ivjKt6VSfixLm1pQrH",
        config: undefined,
      },
      {
        domain: "sns-ip-5-wallet-8",
        result: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
        config: undefined,
      },
      {
        domain: "sns-ip-5-wallet-9",
        result: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        domain: "sns-ip-5-wallet-10",
        result: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
        config: { allowPda: true, programIds: [SYSTEM_PROGRAM_ADDRESS] },
      },
      {
        domain: "sns-ip-5-wallet-10",
        result: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
        config: { allowPda: "any" as AllowPda },
      },
    ])("$domain resolves correctly", async (e) => {
      const resolvedValue = await resolveDomain(TEST_RPC, e.domain, e?.config);
      expect(resolvedValue.toString()).toBe(e.result);
    });

    test.each([
      {
        domain: "sns-ip-5-wallet-3",
        error: new InvalidValidationError(),
      },
      {
        domain: "sns-ip-5-wallet-6",
        error: new PdaOwnerNotAllowedError(),
      },
      {
        domain: "sns-ip-5-wallet-11",
        error: new PdaOwnerNotAllowedError(),
      },
      {
        domain: "sns-ip-5-wallet-12",
        error: new InvalidRoAError(),
      },
    ])("$domain throws correctly", async (e) => {
      await expect(resolveDomain(TEST_RPC, e.domain)).rejects.toThrow(e.error);
    });

    test.each([
      {
        domain: "wallet-guide-5.sol",
        owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
      },
      {
        domain: "wallet-guide-4.sol",
        owner: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
      },
      {
        domain: "wallet-guide-3.sol",
        owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
      },
      {
        domain: "wallet-guide-2.sol",
        owner: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4",
      },
      {
        domain: "wallet-guide-1.sol",
        owner: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4",
      },
      {
        domain: "wallet-guide-0.sol",
        owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
      },
      {
        domain: "sub-0.wallet-guide-3.sol",
        owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
      },
      {
        domain: "sub-1.wallet-guide-3.sol",
        owner: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
      },

      // Record V2
      {
        domain: "wallet-guide-6",
        owner: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
      },
      {
        domain: "wallet-guide-8",
        owner: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4",
      },
    ])("$domain resolves correctly (backward compatibility)", async (e) => {
      const resolvedValue = await resolveDomain(TEST_RPC, e.domain);
      expect(resolvedValue.toString()).toBe(e.owner);
    });
  });

  describe("getAllDomains", () => {
    test("domainAddress/owner", async () => {
      const registered = await getAllDomains(TEST_RPC);
      expect(registered.length).toBeGreaterThan(250_000);
    });
  });
});
