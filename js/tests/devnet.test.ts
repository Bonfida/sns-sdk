require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { devnet } from "../src/devnet";
import { randomBytes } from "crypto";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { NameRegistryState } from "../src/state";
jest.setTimeout(20_000);

// Use custom devnet rpc if rate limited
const connection = new Connection(
  process.env.RPC_URL_DEVNET || "https://api.devnet.solana.com",
);

const OWNER = new PublicKey("3f9fRjLaDSDVxd26xMEm4WuSXv62cGt5qVfEVGwMfTz6");
const OWNER2 = new PublicKey("DjXsn34uz8hnC4KLiSkEVNmzqX5ZFP2Q7aErTBH8LWxe");

test("Registration", async () => {
  const tx = new Transaction();

  const [, ix] = await devnet.bindings.registerDomainName(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    OWNER2,
    getAssociatedTokenAddressSync(NATIVE_MINT, OWNER2, true),
    NATIVE_MINT,
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER2;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Registration V2", async () => {
  const tx = new Transaction();

  const ix = await devnet.bindings.registerDomainNameV2(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    OWNER2,
    getAssociatedTokenAddressSync(NATIVE_MINT, OWNER2, true),
    NATIVE_MINT,
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER2;
  const res = await connection.simulateTransaction(tx);
  console.log(res.value.logs);
  expect(res.value.err).toBe(null);
});

test("Create", async () => {
  const tx = new Transaction();

  const lamports = await connection.getMinimumBalanceForRentExemption(
    1_000 + NameRegistryState.HEADER_LEN,
  );
  const ix = await devnet.bindings.createNameRegistry(
    connection,
    "devnet-test-2",
    1_000,
    OWNER,
    OWNER,
    lamports,
  );
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Delete", async () => {
  const tx = new Transaction();

  const ix = await devnet.bindings.deleteNameRegistry(
    connection,
    "devnet-test-1",
    OWNER,
  );
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Burn", async () => {
  const tx = new Transaction();

  const ix = devnet.bindings.burnDomain("devnet-test-1", OWNER, OWNER);
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Update", async () => {
  const tx = new Transaction();

  const ix = await devnet.bindings.updateNameRegistryData(
    connection,
    "devnet-test-1",
    0,
    Buffer.from("testing-data"),
  );
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Transfer", async () => {
  const tx = new Transaction();

  const ix = await devnet.bindings.transferNameOwnership(
    connection,
    "devnet-test-1",
    OWNER2,
  );
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Create sub", async () => {
  const sub = "gvbhnjklmjnhb";
  const parent = "devnet-test-1";
  const tx = new Transaction();

  const [, ix] = await devnet.bindings.createSubdomain(
    connection,
    sub + "." + parent,
    OWNER,
    2_000,
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = devnet.constants.VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Create reverse", async () => {
  const tx = new Transaction();
  const { pubkey: subkey } = await devnet.utils._deriveSync(
    "subdomain-test.devnet-test-1",
  );

  const [, ix] = await devnet.bindings.createReverseName(
    subkey,
    "subdomain-test.devnet-test-1",
    OWNER,
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Transfer sub", async () => {
  const tx = new Transaction();

  const ix = await devnet.bindings.transferSubdomain(
    connection,
    "subdomain-test.devnet-test-1",
    OWNER2,
  );
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
