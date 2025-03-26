import { describe, expect, jest, test } from "@jest/globals";
import {
  Address,
  IInstruction,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";

import { burnDomain } from "../src/bindings/burnDomain";
import { createNameRegistry } from "../src/bindings/createNameRegistry";
import { createRecord } from "../src/bindings/createRecord";
import { createReverse } from "../src/bindings/createReverse";
import { createSubdomain } from "../src/bindings/createSubdomain";
import { deleteNameRegistry } from "../src/bindings/deleteNameRegistry";
import { deleteRecord } from "../src/bindings/deleteRecord";
import { setPrimaryDomain } from "../src/bindings/setPrimaryDomain";
import { updateRecord } from "../src/bindings/updateRecord";
import { ROOT_DOMAIN_ADDRESS } from "../src/constants/addresses";
import { getDomainAddress } from "../src/domain/getDomainAddress";
import { RegistryState } from "../src/states/registry";
import { Record } from "../src/types/record";
import { TEST_RPC } from "./constants";

jest.setTimeout(50_000);

const testInstructions = async (
  ixs: IInstruction[],
  payer: Address,
  log?: boolean
) => {
  const { value: latestBlockhash } = await TEST_RPC.getLatestBlockhash().send();

  const encodedWireTransaction = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(payer, tx),
    (tx) => appendTransactionMessageInstructions(ixs, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    compileTransaction,
    getBase64EncodedWireTransaction
  );

  const res = await TEST_RPC.simulateTransaction(encodedWireTransaction, {
    encoding: "base64",
    sigVerify: false,
  }).send();

  if (log) {
    console.log(res.value);
  }

  expect(res.value.err).toBe(null);
};

describe("Bindings", () => {
  describe("burnDomain", () => {
    test("wallet-guide-9", async () => {
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;
      const target = "3Wnd5Df69KitZfUoPYZU438eFRNwGHkhLnSAWL65PxJX" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await burnDomain("wallet-guide-9", owner, target));

      await testInstructions(ixs, owner);
    });
  });

  describe("createNameRegistry", () => {
    test("_TEST_", async () => {
      const name = "_TEST_";
      const space = 2000;
      const owner = "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address;
      const lamports = await TEST_RPC.getMinimumBalanceForRentExemption(
        BigInt(space + RegistryState.HEADER_LEN)
      ).send();

      const ixs: IInstruction[] = [];
      ixs.push(
        await createNameRegistry(TEST_RPC, name, space, owner, owner, lamports)
      );
      await testInstructions(ixs, owner);
    });
  });

  describe("createRecord", () => {
    test("domain [wallet-guide-9]", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(domain, Record.Twitter, "@sns", owner, owner)
      );

      await testInstructions(ixs, owner);
    });

    test("subdomain [sub-0.wallet-guide-9]", async () => {
      const domain = "sub-0.wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(domain, Record.Twitter, "@sns", owner, owner)
      );

      await testInstructions(ixs, owner);
    });
  });

  describe("createReverse", () => {
    test("_TEST_", async () => {
      const name = "_TEST_";
      const { address } = await getDomainAddress(name);
      const owner = "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await createReverse(address, name, owner));

      await testInstructions(ixs, owner);
    });
  });

  describe("createSubdomain", () => {
    test("wallet-guide-9", async () => {
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        ...(await createSubdomain(TEST_RPC, "sub-test.wallet-guide-9", owner))
      );

      await testInstructions(ixs, owner);
    });
  });

  describe("deleteNameRegistry", () => {
    test("wallet-guide-9", async () => {
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await deleteNameRegistry(
          TEST_RPC,
          "wallet-guide-9",
          owner,
          undefined,
          ROOT_DOMAIN_ADDRESS
        )
      );

      await testInstructions(ixs, owner);
    });
  });

  describe("deleteRecord", () => {
    describe("domain [wallet-guide-9]", () => {
      test.each([
        {
          record: Record.SOL,
          content: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
        },
        { record: Record.Twitter, content: "@test" },
      ])("$record", async (item) => {
        const domain = "wallet-guide-9";
        const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

        const ixs: IInstruction[] = [];

        ixs.push(
          await createRecord(domain, item.record, item.content, owner, owner)
        );
        ixs.push(await deleteRecord(domain, item.record, owner, owner));

        await testInstructions(ixs, owner);
      });
    });
  });

  describe("registerDomain", () => {});

  describe("registerWithNft", () => {});

  describe("setPrimaryDomain", () => {
    test("domain [wallet-guide-9]", async () => {
      const domain = "wallet-guide-9";
      const domainAddress = (await getDomainAddress(domain)).address;
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await setPrimaryDomain(TEST_RPC, domainAddress, owner));

      await testInstructions(ixs, owner);
    });
    test("subdomain [sub-0.wallet-guide-9]", async () => {
      const domain = "sub-0.wallet-guide-9";
      const domainAddress = (await getDomainAddress(domain)).address;
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await setPrimaryDomain(TEST_RPC, domainAddress, owner));

      await testInstructions(ixs, owner);
    });
  });

  describe("updateRecord", () => {
    test("domain [wallet-guide-9]", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(domain, Record.Twitter, "@test", owner, owner)
      );
      ixs.push(
        await updateRecord(domain, Record.Twitter, "@sns", owner, owner)
      );

      await testInstructions(ixs, owner);
    });

    test("subdomain [sub-0.wallet-guide-9]", async () => {
      const domain = "sub-0.wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(domain, Record.Twitter, "@test", owner, owner)
      );
      ixs.push(
        await updateRecord(domain, Record.Twitter, "@sns", owner, owner)
      );

      await testInstructions(ixs, owner);
    });
  });
});
