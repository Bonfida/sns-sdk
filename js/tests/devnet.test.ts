require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { devnet } from "../src/devnet";
import { randomBytes } from "crypto";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";

jest.setTimeout(20_000);

const connection = new Connection(process.env.RPC_URL_DEVNET!);

const PAYER = new PublicKey("DjXsn34uz8hnC4KLiSkEVNmzqX5ZFP2Q7aErTBH8LWxe");

test("Registration", async () => {
  const tx = new Transaction();

  const [, ix] = await devnet.bindings.registerDomainName(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    PAYER,
    getAssociatedTokenAddressSync(NATIVE_MINT, PAYER, true),
    NATIVE_MINT,
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = PAYER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
