require("dotenv").config();
import { test, expect } from "@jest/globals";
import {
  deserializeRecordV2Content,
  getMultipleRecordsV2,
  getRecordV2,
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
  writRoaRecordV2,
} from "../src/bindings";

jest.setTimeout(50_000);

const connection = new Connection(process.env.RPC_URL!);

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
  const domain = "wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  const ix = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
  );
  const tx = new Transaction().add(ix);
  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Update record", async () => {
  const domain = "wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");

  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
  );
  tx.add(ix_1);
  const ix_2 = updateRecordV2Instruction(
    domain,
    Record.Github,
    "some text",
    owner,
    owner,
  );
  tx.add(ix_2);
  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Delete record", async () => {
  const domain = "wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");

  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
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
  const domain = "wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");

  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
  );
  tx.add(ix_1);
  const ix_2 = validateRecordV2Content(
    true,
    domain,
    Record.Github,
    owner,
    owner,
    owner,
  );
  tx.add(ix_2);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("ETH Verify", async () => {
  const domain = "wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  // Record key: E4MZzSfkf59UVFYVux5WEufghvWxUktf6e5EaUuDExAc
  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.ETH,
    "0x4bfbfd1e018f9f27eeb788160579daf7e2cd7da7",
    owner,
    owner,
  );

  tx.add(ix_1);

  const ix_2 = validateRecordV2Content(
    true,
    domain,
    Record.ETH,
    owner,
    owner,
    owner,
  );
  tx.add(ix_2);

  const ix_3 = ethValidateRecordV2Content(
    domain,
    Record.ETH,
    owner,
    owner,
    Buffer.from([
      78, 235, 200, 2, 51, 5, 225, 127, 83, 156, 25, 226, 53, 239, 196, 189,
      196, 197, 121, 2, 91, 2, 99, 11, 31, 179, 5, 233, 52, 246, 137, 252, 72,
      27, 67, 15, 86, 42, 62, 117, 140, 223, 159, 142, 86, 227, 233, 185, 149,
      111, 92, 122, 147, 23, 217, 1, 66, 72, 63, 150, 27, 219, 152, 10, 28,
    ]),
    Buffer.from([
      75, 251, 253, 30, 1, 143, 159, 39, 238, 183, 136, 22, 5, 121, 218, 247,
      226, 205, 125, 167,
    ]),
  );
  tx.add(ix_3);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("RoA record", async () => {
  const domain = "wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  const tx = new Transaction();
  const ix_1 = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
  );
  tx.add(ix_1);

  const ix_2 = writRoaRecordV2(domain, Record.Github, owner, owner, owner);
  tx.add(ix_2);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Create record for sub", async () => {
  const domain = "sub-0.wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  const ix = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
  );
  const tx = new Transaction().add(ix);
  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Create record for sub & update & verify staleness & delete", async () => {
  const domain = "sub-0.wallet-guide-9";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  const tx = new Transaction();
  const ix_create = createRecordV2Instruction(
    domain,
    Record.Github,
    "bonfida",
    owner,
    owner,
  );
  tx.add(ix_create);

  const ix_update = updateRecordV2Instruction(
    domain,
    Record.Github,
    "somethingelse",
    owner,
    owner,
  );
  tx.add(ix_update);

  const ix_verify = validateRecordV2Content(
    true,
    domain,
    Record.Github,
    owner,
    owner,
    owner,
  );
  tx.add(ix_verify);

  const ix_delete = deleteRecordV2(domain, Record.Github, owner, owner);
  tx.add(ix_delete);

  tx.feePayer = owner;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("getRecordV2", async () => {
  const domain = "wallet-guide-9.sol";
  const items = [
    { record: Record.IPFS, value: "ipfs://test" },
    { record: Record.Email, value: "test@gmail.com" },
    { record: Record.Url, value: "https://google.com" },
  ];
  for (let item of items) {
    const res = await getRecordV2(connection, domain, item.record, {
      deserialize: true,
    });
    expect(res.deserializedContent).toBe(item.value);
  }
});

test("getMultipleRecordsV2", async () => {
  const domain = "wallet-guide-9.sol";
  const items = [
    { record: Record.IPFS, value: "ipfs://test" },
    { record: Record.Email, value: "test@gmail.com" },
    { record: Record.Url, value: "https://google.com" },
  ];
  const res = await getMultipleRecordsV2(
    connection,
    domain,
    items.map((e) => e.record),
    {
      deserialize: true,
    },
  );
  for (let i = 0; i < items.length; i++) {
    expect(items[i].value).toBe(res[i]?.deserializedContent);
    expect(items[i].record).toBe(res[i]?.record);
  }
});
