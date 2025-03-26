import { describe, expect, jest, test } from "@jest/globals";
import { Address } from "@solana/kit";

import { getNftMint } from "../src/nft/getNftMint";
import { getNftOwner } from "../src/nft/getNftOwner";
import { TEST_RPC } from "./constants";

jest.setTimeout(5_000);

describe("Nft methods", () => {
  describe("getNftMint", () => {
    test.each([
      {
        // sns-ip-5-wallet-1.sol
        address: "6qJtQdAJvAiSfGXWAuHDteAes6vnFcxtHmLzw1TStCrd" as Address,
        mint: "8dJNBsnM5Zo8RUy94Y9Te1EJa77NXG1T556zpMp8UYnv",
      },
      {
        //  sns-ip-5-wallet-2.so
        address: "FVLJ5KEqQk3jiHsB84Rt5cnUac4s8fyHC2YaNDJVwKHJ" as Address,
        mint: "CmThLmf7ndEbyPs2MyL3XXzLvCrmXtdNCrRcuNPHvkKL",
      },
    ])("$address", async (item) => {
      const res = await getNftMint(item.address);
      expect(res).toBe(item.mint);
    });
  });

  describe("getNftOwner", () => {
    test.each([
      {
        // sns-ip-5-wallet-1.sol
        address: "6qJtQdAJvAiSfGXWAuHDteAes6vnFcxtHmLzw1TStCrd" as Address,
        owner: "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs",
      },
      {
        //  sns-ip-5-wallet-2.so
        address: "FVLJ5KEqQk3jiHsB84Rt5cnUac4s8fyHC2YaNDJVwKHJ" as Address,
        owner: null,
      },
    ])("$address", async (item) => {
      const res = await getNftOwner(TEST_RPC, item.address);
      expect(res).toBe(item.owner);
    });
  });
});
