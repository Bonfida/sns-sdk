import { test, jest } from "@jest/globals";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createSubdomain } from "../src/bindings";
import { randomBytes } from "crypto";
import { VAULT_OWNER } from "../src/constants";

jest.setTimeout(20_000);

const connection = new Connection("https://rpc-public.hellomoon.io");

test("Create sub", async () => {
  const tx = new Transaction();
  const [, ix] = await createSubdomain(
    connection,
    randomBytes(10).toString("hex") + ".bonfida",
    new PublicKey("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA"),
    2_000
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
