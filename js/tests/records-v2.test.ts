import { test, expect } from "@jest/globals";
import {
  deserializeRecordV2Content,
  getRecordV2Key,
  serializeRecordV2Content,
} from "../src/record_v2";
import { Record } from "../src/types/record";
import { Keypair, Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createRecordV2Instruction,
  deleteRecordV2,
  ethValidateRecordV2Content,
  updateRecordV2Instruction,
  validateRecordV2Content,
} from "../src/bindings";
import fs from "fs";
import { Validation } from "@bonfida/sns-records";

jest.setTimeout(50_000);

const connection = new Connection("https://rpc-public.hellomoon.io");

test("Records V2 des/ser", () => {
  let content = "this is a test";
  let ser = serializeRecordV2Content(content, Record.TXT);
  let des = deserializeRecordV2Content(Buffer.from(ser), Record.TXT);
  expect(des).toBe(content);

  content = Keypair.generate().publicKey.toBase58();
  ser = serializeRecordV2Content(content, Record.SOL);
  des = deserializeRecordV2Content(Buffer.from(ser), Record.SOL);
  expect(des).toBe(content);
  expect(ser.length).toBe(32);
});

test("Create record", async () => {
  const domain = "record-v2";
  const owner = new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");
  const ix = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner
  );
  const tx = new Transaction().add(ix);
  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Update record", async () => {
  const domain = "record-v2";
  const owner = new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");

  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner
  );
  tx.add(ix_1);
  const ix_2 = updateRecordV2Instruction(
    domain,
    Record.Github,
    "some text",
    owner,
    owner
  );
  tx.add(ix_2);
  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Delete record", async () => {
  const domain = "record-v2";
  const owner = new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");

  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner
  );
  tx.add(ix_1);
  const ix_2 = deleteRecordV2(domain, Record.Github, owner, owner);
  tx.add(ix_2);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

// test("Verify", async () => {
//   const path = "~/Desktop/wallets/cs_wallet_2.json";
//   const wallet = Keypair.fromSecretKey(
//     new Uint8Array(JSON.parse(fs.readFileSync(path).toString()))
//   );
//   const domain = "fdjgndfsklgdfg";

//   const tx = new Transaction();
//   const ixCreate = createRecordV2Instruction(
//     domain,
//     Record.Github,
//     "test",
//     wallet.publicKey,
//     wallet.publicKey
//   );

//   const ixVerify = validateRecordV2Content(
//     true,
//     domain,
//     Record.Github,
//     wallet.publicKey,
//     wallet.publicKey,
//     wallet.publicKey
//   );

//   tx.add(ixCreate).add(ixVerify);

// });

test("Solana Verify", async () => {
  const domain = "record-v2";
  const owner = new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");

  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner
  );
  tx.add(ix_1);
  const ix_2 = validateRecordV2Content(
    true,
    domain,
    Record.Github,
    owner,
    owner,
    owner
  );
  tx.add(ix_2);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("ETH Verify", async () => {
  const domain = "record-v2";
  const owner = new PublicKey("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");
  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "Hello",
    owner,
    owner
  );
  tx.add(ix_1);
  const ix_2 = ethValidateRecordV2Content(
    domain,
    Record.Github,
    owner,
    owner,
    Buffer.from([
      28, 47, 226, 190, 20, 146, 215, 159, 168, 224, 242, 186, 225, 81, 69, 206,
      84, 233, 143, 106, 135, 125, 20, 150, 43, 110, 236, 33, 185, 166, 82, 194,
      123, 108, 155, 24, 104, 187, 255, 71, 166, 62, 212, 83, 6, 52, 96, 30, 4,
      135, 171, 97, 80, 76, 154, 100, 222, 91, 85, 146, 190, 143, 32, 108, 28,
    ]),
    Buffer.from([
      75, 251, 253, 30, 1, 143, 159, 39, 238, 183, 136, 22, 5, 121, 218, 247,
      226, 205, 125, 167,
    ])
  );
  tx.add(ix_2);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});
