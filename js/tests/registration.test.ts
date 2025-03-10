require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { registerDomainNameV2 } from "../src/bindings/registerDomainNameV2";
import { registerWithNft } from "../src/bindings/registerWithNft";
import { randomBytes } from "crypto";
import { REFERRERS } from "../src/constants";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getDomainKeySync } from "../src/utils/getDomainKeySync";
import { getReverseKeySync } from "../src/utils/getReverseKeySync";
import { Metaplex } from "@metaplex-foundation/js";

jest.setTimeout(20_000);
jest.retryTimes(3);
const FIDA_MINT = new PublicKey("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp");
const PYTH_MINT = new PublicKey("HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3");

const connection = new Connection(process.env.RPC_URL!);

const VAULT_OWNER = new PublicKey(
  "5D2zKog251d6KPCyFyLMt3KroWwXXPWSgTPyhV22K2gR",
);

test("Register with NFT", async () => {
  const tx = new Transaction();
  const domain = randomBytes(10).toString("hex");
  const { pubkey } = getDomainKeySync(domain);
  const reverse = getReverseKeySync(domain);
  // https://solscan.io/collection/3c138f8640f62b62016f8020f0532ff888bb0866363c26fb2241bcf28c0776ad#holders
  const holder = new PublicKey("FiUYY19eXuVcEAHSJ87KEzYjYnfKZm6KbHoVtdQBNGfk");
  const source = new PublicKey("Df9Jz3NrGVd5jjjrXbedwuHbCc1hL131bUXq2143tTfQ");

  const metaplex = new Metaplex(connection);
  const nftMint = new PublicKey("7cpq5U6ze5PPcTPVxGifXA8xyDp8rgAJQNwBDj8eWd8w");
  const nftMetadata = metaplex.nfts().pdas().metadata({ mint: nftMint });
  const masterEdition = metaplex.nfts().pdas().masterEdition({ mint: nftMint });
  const ix = registerWithNft(
    domain,
    1_000,
    pubkey,
    reverse,
    holder,
    source,
    nftMetadata,
    nftMint,
    masterEdition,
  );
  tx.add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Indempotent ATA creation ref", async () => {
  const tx = new Transaction();
  for (let i = 0; i < 3; i++) {
    const ix = await registerDomainNameV2(
      connection,
      randomBytes(10).toString("hex"),
      1_000,
      VAULT_OWNER,
      getAssociatedTokenAddressSync(PYTH_MINT, VAULT_OWNER, true),
      PYTH_MINT,
      REFERRERS[0],
    );
    tx.add(...ix);
  }
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Register V2", async () => {
  const tx = new Transaction();
  const ix = await registerDomainNameV2(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    VAULT_OWNER,
    getAssociatedTokenAddressSync(FIDA_MINT, VAULT_OWNER, true),
    FIDA_MINT,
    REFERRERS[1],
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Registration V2 with ref", async () => {
  const tx = new Transaction();
  const ix = await registerDomainNameV2(
    connection,
    randomBytes(10).toString("hex"),
    1_000,
    VAULT_OWNER,
    getAssociatedTokenAddressSync(FIDA_MINT, VAULT_OWNER, true),
    FIDA_MINT,
    REFERRERS[1],
  );
  tx.add(...ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = VAULT_OWNER;
  const res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});
