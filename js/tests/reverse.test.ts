require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import { Connection, Transaction } from "@solana/web3.js";
import { createSubdomain } from "../src/bindings";
import { VAULT_OWNER } from "../src/constants";
import { resolve } from "../src/resolve";

jest.setTimeout(5_000);

const connection = new Connection(process.env.RPC_URL!);

test("Create sub", async () => {
  const sub = "gvbhnjklmjnhb";
  const parent = "bonfida.sol";

  const parentOwner = await resolve(connection, parent);
  const [, ix] = await createSubdomain(
    connection,
    sub + "." + parent,
    parentOwner,
    1_000,
  );
  const tx = new Transaction();
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();

  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
