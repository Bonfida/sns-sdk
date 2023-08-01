import { test, expect } from "@jest/globals";
import {
  deserializeRecordV2,
  serializeRecordV2Content,
  verifyEthereumSignature,
} from "../src/record_v2";
import { Record } from "../src/types/record";
import { Keypair } from "@solana/web3.js";

test("Records V2 des/ser", () => {
  let content = "this is a test";
  let ser = serializeRecordV2Content(content, Record.TXT);
  let des = deserializeRecordV2(Buffer.from(ser), Record.TXT);
  expect(des).toBe(content);

  content = Keypair.generate().publicKey.toBase58();
  ser = serializeRecordV2Content(content, Record.SOL);
  des = deserializeRecordV2(Buffer.from(ser), Record.SOL);
  expect(des).toBe(content);
  expect(ser.length).toBe(32);
});

test("Verify ETH signature", () => {
  // Found here https://etherscan.io/verifySig/22233
  const example = {
    address: "0xe88cb208c598e99949ddc23e2a534550391fc5aa",
    msg: "Hello",
    sig: "0x181a40c6b45a28b4189a94b783e85136917ca6cc205a2d39838ac0a1d2b3b705541a2cd551c0e4445ddc4a225c9f8b3ea531c869d4e87ef30ef4b75c8339332d1b",
  };
  const isValid = verifyEthereumSignature(
    example.msg,
    example.sig,
    example.address
  );
  expect(isValid).toBe(true);
});
