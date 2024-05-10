require("dotenv").config();
import {
  PythHttpClient,
  getPythProgramKeyForCluster,
} from "@pythnetwork/client";
import { Connection } from "@solana/web3.js";
import { PYTH_FEEDS, PYTH_PULL_FEEDS, TOKENS_SYM_MINT } from "../src/constants";
import { getPythFeedAccountKey } from "../src/utils";

const connection = new Connection(process.env.RPC_URL!);

test("Price & Product keys", async () => {
  const pythConnection = new PythHttpClient(
    connection,
    getPythProgramKeyForCluster("mainnet-beta"),
  );

  const data = await pythConnection.getData();

  for (let mint of TOKENS_SYM_MINT.keys()) {
    const symbol = TOKENS_SYM_MINT.get(mint)!;
    const priceData = data.productPrice.get("Crypto." + symbol + "/USD")!;
    const productData = data.productFromSymbol.get(
      "Crypto." + symbol + "/USD",
    )!;

    const { product, price } = PYTH_FEEDS.get(mint)!;

    expect(priceData.productAccountKey.toBase58()).toBe(product);
    expect(productData.price_account).toBe(price);
  }
});

test("Pyth Pull derivation", () => {
  const sample = [
    {
      mint: "So11111111111111111111111111111111111111112",
      key: "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE",
    },
    {
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      key: "Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX",
    },
    {
      mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      key: "5CKzb9j4ChgLUt8Gfm5CNGLN6khXKiqMbnGAW4cgXgxK",
    },
    {
      mint: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
      key: "2cfmeuVBf7bvBJcjKBQgAwfvpUvdZV7K8NZxUEuccrub",
    },
  ];
  sample.forEach((e) => {
    const [key] = getPythFeedAccountKey(0, PYTH_PULL_FEEDS.get(e.mint)!);
    expect(key.toBase58()).toBe(e.key);
  });
});
