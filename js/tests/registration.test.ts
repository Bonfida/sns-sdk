import { test, jest } from "@jest/globals";
import { Connection, Transaction, clusterApiUrl } from "@solana/web3.js";
import { registerDomainName } from "../src/bindings";
import { randomBytes } from "crypto";
import { USDC_MINT, VAULT_OWNER } from "../src/constants";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

jest.setTimeout(20_000);

const connection = new Connection(clusterApiUrl("mainnet-beta"));

test("Registration", async () => {
  const tx = new Transaction();
  const [, ix] = await registerDomainName(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    VAULT_OWNER,
    getAssociatedTokenAddressSync(USDC_MINT, VAULT_OWNER),
    USDC_MINT
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
