require("dotenv").config();
import {
  PythHttpClient,
  getPythProgramKeyForCluster,
} from "@pythnetwork/client";
import { Connection } from "@solana/web3.js";
import { PYTH_FEEDS, TOKENS_SYM_MINT } from "../src/constants";

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
