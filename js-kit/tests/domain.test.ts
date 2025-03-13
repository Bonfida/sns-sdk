import { describe, expect, jest, test } from "@jest/globals";
import {
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
} from "@solana/kit";
import * as dotenv from "dotenv";

import { SYSTEM_PROGRAM } from "../src/constants/addresses";
import { getDomainRecords } from "../src/domain/getDomainRecords";
import { AllowPda, resolveDomain } from "../src/domain/resolveDomain";
import {
  InvalidRoAError,
  InvalidValidationError,
  MissingVerifierError,
  PdaOwnerNotAllowedError,
} from "../src/errors";
import { Record } from "../src/types/record";

dotenv.config();

jest.setTimeout(50_000);

// Create an HTTP transport or any custom transport of your choice.
const transport = createDefaultRpcTransport({
  url: process.env.RPC_URL!,
});

// Create an RPC client using that transport.
const rpc = createSolanaRpcFromTransport(transport);

describe("Domain methods", () => {
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
        config: { allowPda: true, programIds: [SYSTEM_PROGRAM] },
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
        config: { allowPda: true, programIds: [SYSTEM_PROGRAM] },
      },
      {
        domain: "sns-ip-5-wallet-10",
        result: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
        config: { allowPda: "any" as AllowPda },
      },
    ])("$domain resolves correctly", async (e) => {
      const resolvedValue = await resolveDomain(rpc, e.domain, e?.config);
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
    ])("$domain throws an error", async (e) => {
      await expect(resolveDomain(rpc, e.domain)).rejects.toThrow(e.error);
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
      const resolvedValue = await resolveDomain(rpc, e.domain);
      expect(resolvedValue.toString()).toBe(e.owner);
    });
  });

  test("getDomainRecords", async () => {
    const domain = "wallet-guide-9.sol";
    const items = [
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
      rpc,
      domain,
      items.map((item) => item.record),
      {
        deserialize: true,
        verifiers: items.map(() => undefined),
      }
    );
    items.forEach((item, idx) => {
      if (item.value) {
        expect(res[idx]?.deserializedContent).toBe(item.value);
        expect(res[idx]?.verified).toStrictEqual(item.verified);
      } else {
        expect(res[idx]).toBe(undefined);
      }
    });

    await expect(
      getDomainRecords(
        rpc,
        domain,
        items.map((item) => item.record),
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
