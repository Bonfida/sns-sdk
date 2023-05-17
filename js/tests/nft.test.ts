import { test, jest } from "@jest/globals";
import { PublicKey, Connection } from "@solana/web3.js";
import { getTokenizedDomains } from "../src/nft";

jest.setTimeout(10_000);
const connection = new Connection("https://rpc-public.hellomoon.io");

test("Get tokenized domains", async () => {
  const domains = await getTokenizedDomains(
    connection,
    new PublicKey("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2")
  );
  console.log(domains);
});
