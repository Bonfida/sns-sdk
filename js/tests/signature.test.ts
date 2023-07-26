import { test, jest, expect } from "@jest/globals";
import { verifyEthereumSignature } from "../src/record_v2";

// Found here https://etherscan.io/verifySig/22233
test("Signature", () => {
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
