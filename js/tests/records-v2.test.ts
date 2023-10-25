import { test, expect } from "@jest/globals";
import {
  deserializeRecordV2Content,
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
  // Record key: 5o7jXJuQ6k5RZQQEixJWv7DMm2yr23hNnSpGJsYzPxD2
  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "Hello",
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

  const ix_3 = ethValidateRecordV2Content(
    domain,
    Record.Github,
    owner,
    owner,
    Buffer.from([
      70, 1, 125, 86, 85, 208, 173, 211, 211, 232, 180, 49, 254, 41, 240, 59,
      145, 27, 213, 251, 253, 93, 63, 232, 64, 246, 178, 93, 146, 115, 145, 188,
      51, 89, 192, 230, 99, 53, 111, 61, 241, 130, 199, 229, 236, 81, 46, 185,
      230, 126, 95, 64, 99, 118, 168, 106, 185, 192, 55, 4, 170, 138, 96, 91,
      27,
    ]),
    Buffer.from([
      75, 251, 253, 30, 1, 143, 159, 39, 238, 183, 136, 22, 5, 121, 218, 247,
      226, 205, 125, 167,
    ])
  );
  tx.add(ix_3);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});
