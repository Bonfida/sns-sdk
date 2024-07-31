require("dotenv").config();
import { test, jest, expect, describe } from "@jest/globals";
import { Connection, SystemProgram } from "@solana/web3.js";
import { AllowPda, resolve } from "../src/resolve/resolve";
import {
  InvalidRoAError,
  PdaOwnerNotAllowed,
  WrongValidation,
} from "../src/error";

jest.setTimeout(50_000);

const connection = new Connection(process.env.RPC_URL!);

describe("resolve", () => {
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
      config: { allowPda: true, programIds: [SystemProgram.programId] },
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

    // {
    //   domain: "wallet-guide-4",
    //   result: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
    //   config: undefined,
    // },

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
      config: { allowPda: true, programIds: [SystemProgram.programId] },
    },
    {
      domain: "sns-ip-5-wallet-10",
      result: "96GKJgm2W3P8Bae78brPrJf4Yi9AN1wtPJwg2XVQ2rMr",
      config: { allowPda: "any" as AllowPda },
    },
  ])("$domain resolves correctly", async (e) => {
    const resolvedValue = await resolve(connection, e.domain, e?.config);
    expect(resolvedValue.toBase58()).toBe(e.result);
  });

  test.each([
    {
      domain: "sns-ip-5-wallet-3",
      error: new WrongValidation(),
    },
    {
      domain: "sns-ip-5-wallet-6",
      error: new PdaOwnerNotAllowed(),
    },
    {
      domain: "sns-ip-5-wallet-11",
      error: new PdaOwnerNotAllowed(),
    },
    {
      domain: "sns-ip-5-wallet-12",
      error: new InvalidRoAError(),
    },
  ])("$domain throws an error", async (e) => {
    await expect(resolve(connection, e.domain)).rejects.toThrow(e.error);
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
    const resolvedValue = await resolve(connection, e.domain);
    expect(resolvedValue.toBase58()).toBe(e.owner);
  });
});
