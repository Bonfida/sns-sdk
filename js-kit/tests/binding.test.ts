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
import { updateNameRegistry } from "../src/bindings/updateNameRegistry";
import { updateRecord } from "../src/bindings/updateRecord";
import { validateRoa } from "../src/bindings/validateRoa";
import { validateRoaEthereum } from "../src/bindings/validateRoaEthereum";
import { writeRoa } from "../src/bindings/writeRoa";
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

jest.setTimeout(30_000);

const testInstructions = async (ixs: IInstruction[], payer: Address) => {
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

      await testInstructions(ixs, owner);
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

  describe("updateRegistry", () => {
    test("wallet-guide-9", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await updateNameRegistry(
          TEST_RPC,
          domain,
          0,
          Buffer.from("test data"),
          undefined,
          ROOT_DOMAIN_ADDRESS
        )
      );

      await testInstructions(ixs, owner);
    });
  });

  describe("validateRoaEthereum", () => {
    test("wallet-guide-9", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(
          domain,
          Record.ETH,
          "0x4bfbfd1e018f9f27eeb788160579daf7e2cd7da7",
          owner,
          owner
        )
      );
      ixs.push(
        await validateRoa(true, domain, Record.ETH, owner, owner, owner)
      );
      ixs.push(
        await validateRoaEthereum(
          domain,
          Record.ETH,
          owner,
          owner,
          new Uint8Array([
            78, 235, 200, 2, 51, 5, 225, 127, 83, 156, 25, 226, 53, 239, 196,
            189, 196, 197, 121, 2, 91, 2, 99, 11, 31, 179, 5, 233, 52, 246, 137,
            252, 72, 27, 67, 15, 86, 42, 62, 117, 140, 223, 159, 142, 86, 227,
            233, 185, 149, 111, 92, 122, 147, 23, 217, 1, 66, 72, 63, 150, 27,
            219, 152, 10, 28,
          ]),
          new Uint8Array([
            75, 251, 253, 30, 1, 143, 159, 39, 238, 183, 136, 22, 5, 121, 218,
            247, 226, 205, 125, 167,
          ])
        )
      );
      await testInstructions(ixs, owner);
    });
  });

  describe("validateRoa", () => {
    test("wallet-guide-9", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(domain, Record.Twitter, "@sns", owner, owner)
      );
      ixs.push(
        await validateRoa(true, domain, Record.Twitter, owner, owner, owner)
      );

      await testInstructions(ixs, owner);
    });
  });

  describe("writeRoa", () => {
    test("wallet-guide-9", async () => {
      const domain = "wallet-guide-9";
      const owner = "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8" as Address;

      const ixs: IInstruction[] = [];
      ixs.push(
        await createRecord(domain, Record.Twitter, "@sns", owner, owner)
      );
      ixs.push(await writeRoa(domain, Record.Twitter, owner, owner, owner));

      await testInstructions(ixs, owner);
    });
  });
});
