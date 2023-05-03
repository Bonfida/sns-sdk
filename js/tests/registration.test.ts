import { test, jest } from "@jest/globals";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { registerDomainName } from "../src/bindings";
import { randomBytes } from "crypto";
import { REFERRERS, USDC_MINT, VAULT_OWNER } from "../src/constants";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

jest.setTimeout(20_000);
const FIDA_MINT = new PublicKey("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");

const connection = new Connection("https://rpc-public.hellomoon.io");

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

test("Registration with ref", async () => {
  const tx = new Transaction();
  const [, ix] = await registerDomainName(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    VAULT_OWNER,
    getAssociatedTokenAddressSync(FIDA_MINT, VAULT_OWNER),
    FIDA_MINT,
    REFERRERS[1]
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
