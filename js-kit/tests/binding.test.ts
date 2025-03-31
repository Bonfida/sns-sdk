import { describe, expect, jest, test } from "@jest/globals";
import {
  TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
} from "@solana-program/token";
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
import { randomBytes } from "crypto";

import { burnDomain } from "../src/bindings/burnDomain";
import { createNameRegistry } from "../src/bindings/createNameRegistry";
import { createRecord } from "../src/bindings/createRecord";
import { createReverse } from "../src/bindings/createReverse";
import { createSubdomain } from "../src/bindings/createSubdomain";
import { deleteNameRegistry } from "../src/bindings/deleteNameRegistry";
import { deleteRecord } from "../src/bindings/deleteRecord";
import { registerDomain } from "../src/bindings/registerDomain";
import { registerWithNft } from "../src/bindings/registerWithNft";
import { setPrimaryDomain } from "../src/bindings/setPrimaryDomain";
import { transferDomain } from "../src/bindings/transferDomain";
import { transferSubdomain } from "../src/bindings/transferSubdomain";
import { updateRecord } from "../src/bindings/updateRecord";
import {
  FIDA_MINT,
  REFERRERS,
  ROOT_DOMAIN_ADDRESS,
  USDC_MINT,
  VAULT_OWNER,
} from "../src/constants/addresses";
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
    console.log(res.value.logs);
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
    const domain = randomBytes(10).toString("hex");
    test(domain, async () => {
      const space = 2000;
      const owner = "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address;
      const lamports = await TEST_RPC.getMinimumBalanceForRentExemption(
        BigInt(space + RegistryState.HEADER_LEN)
      ).send();

      const ixs: IInstruction[] = [];
      ixs.push(
        await createNameRegistry(
          TEST_RPC,
          domain,
          space,
          owner,
          owner,
          lamports
        )
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
    const domain = randomBytes(10).toString("hex");
    test(domain, async () => {
      const { address } = await getDomainAddress(domain);
      const owner = "HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await createReverse(address, domain, owner));

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

  describe("registerDomain", () => {
    describe("without referrer", () => {
      test.each(
        Array.from({ length: 3 }, () => ({
          domain: randomBytes(10).toString("hex"),
        }))
      )("$domain", async ({ domain }) => {
        const [ata] = await findAssociatedTokenPda({
          mint: USDC_MINT,
          owner: VAULT_OWNER,
          tokenProgram: TOKEN_PROGRAM_ADDRESS,
        });

        const ixs = await registerDomain(
          TEST_RPC,
          domain,
          1_000,
          VAULT_OWNER,
          ata,
          USDC_MINT
        );

        await testInstructions(ixs, VAULT_OWNER);
      });
    });
    describe("with referrer", () => {
      test.each(
        Array.from({ length: 3 }, () => ({
          domain: randomBytes(10).toString("hex"),
        }))
      )("$domain", async ({ domain }) => {
        const [ata] = await findAssociatedTokenPda({
          mint: FIDA_MINT,
          owner: VAULT_OWNER,
          tokenProgram: TOKEN_PROGRAM_ADDRESS,
        });

        const ixs = await registerDomain(
          TEST_RPC,
          domain,
          1_000,
          VAULT_OWNER,
          ata,
          FIDA_MINT,
          REFERRERS[0]
        );

        await testInstructions(ixs, VAULT_OWNER);
      });
      test("Idempotent referrer ATA creation", async () => {
        const [ata] = await findAssociatedTokenPda({
          mint: FIDA_MINT,
          owner: VAULT_OWNER,
          tokenProgram: TOKEN_PROGRAM_ADDRESS,
        });

        const ixs: IInstruction[] = [];

        for (let i = 0; i < 3; i++) {
          ixs.push(
            ...(await registerDomain(
              TEST_RPC,
              randomBytes(10).toString("hex"),
              1_000,
              VAULT_OWNER,
              ata,
              FIDA_MINT,
              REFERRERS[0]
            ))
          );
        }

        await testInstructions(ixs, VAULT_OWNER);
      });
    });
  });

  describe("registerWithNft", () => {
    const domain = randomBytes(10).toString("hex");
    test(domain, async () => {
      const buyer = "FiUYY19eXuVcEAHSJ87KEzYjYnfKZm6KbHoVtdQBNGfk" as Address;
      const source = "Df9Jz3NrGVd5jjjrXbedwuHbCc1hL131bUXq2143tTfQ" as Address;
      const nftMint = "7cpq5U6ze5PPcTPVxGifXA8xyDp8rgAJQNwBDj8eWd8w" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await registerWithNft(domain, 1_000, buyer, source, nftMint));
    });
  });

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

  describe("transferDomain", () => {
    test("wallet-guide-9", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;
      const newOwner =
        "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await transferDomain(
          TEST_RPC,
          domain,
          newOwner,
          undefined,
          ROOT_DOMAIN_ADDRESS
        )
      );

      await testInstructions(ixs, owner, true);
    });
  });

  describe("transferSubdomain", () => {
    test("sub-0.wallet-guide-3", async () => {
      const subdomain = "sub-0.wallet-guide-3";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;
      const newOwner =
        "ALd1XSrQMCPSRayYUoUZnp6KcP6gERfJhWzkP49CkXKs" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(await transferSubdomain(TEST_RPC, subdomain, newOwner));

      await testInstructions(ixs, owner, true);
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

  describe("updateRegistry", () => {});

  describe("VerifyRecordRoa", () => {});

  describe("VerifyRecordWithEthSig", () => {});

  describe("VerifyRecordWithSolSig", () => {});
});
