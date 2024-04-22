require("dotenv").config();
import { test, jest } from "@jest/globals";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createSubdomain, transferSubdomain } from "../src/bindings";
import { randomBytes } from "crypto";
import { VAULT_OWNER } from "../src/constants";
import { findSubdomains, getDomainKeySync } from "../src/utils";
import { resolve } from "../src/resolve";

jest.setTimeout(20_000);

const connection = new Connection(process.env.RPC_URL!);

test("Create sub", async () => {
  const tx = new Transaction();
  const [, ix] = await createSubdomain(
    connection,
    randomBytes(10).toString("hex") + ".bonfida",
    new PublicKey("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA"),
    2_000,
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Transfer sub", async () => {
  let tx = new Transaction();
  const owner = new PublicKey("J6QDztZCegYTWnGUYtjqVS9d7AZoS43UbEQmMcdGeP5s");
  const parentOwner = new PublicKey(
    "J6QDztZCegYTWnGUYtjqVS9d7AZoS43UbEQmMcdGeP5s",
  );
  let ix = await transferSubdomain(
    connection,
    "test.0x33.sol",
    PublicKey.default,
    false,
  );
  tx.add(ix);
  let blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = owner;
  let res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);

  tx = new Transaction();
  ix = await transferSubdomain(
    connection,
    "test.0x33.sol",
    PublicKey.default,
    true,
  );
  tx.add(ix);
  blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = parentOwner;
  res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Find sub domain", async () => {
  const subs = await findSubdomains(
    connection,
    getDomainKeySync("bonfida").pubkey,
  );
  const expectedSub = ["dex", "naming", "test"];
  subs.sort().forEach((e, idx) => expect(e).toBe(expectedSub[idx]));
});

test("Create sub - Fee payer ", async () => {
  const sub = "gvbhnjklmjnhb";
  const parent = "bonfida.sol";
  const feePayer = VAULT_OWNER;

  const parentOwner = await resolve(connection, parent);
  const [, ix] = await createSubdomain(
    connection,
    sub + "." + parent,
    parentOwner,
    1_000,
    feePayer,
  );
  const tx = new Transaction();
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();

  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
