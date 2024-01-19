require("dotenv").config();
import { test, expect } from "@jest/globals";
import {
  getTwitterHandleandRegistryKeyViaFilters,
  getHandleAndRegistryKey,
  createVerifiedTwitterRegistry,
  deleteTwitterRegistry,
  getTwitterRegistryKey,
  getTwitterRegistry,
  ReverseTwitterRegistryState,
} from "../src/twitter_bindings";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { TWITTER_ROOT_PARENT_REGISTRY_KEY } from "../src/constants";

jest.setTimeout(50_000);

const connection = new Connection(process.env.RPC_URL!);

test("Resolution & derivation", async () => {
  // Example randomly taken
  const expected = {
    handle: "plenthor",
    registry: "HrguVp54KnhQcRPaEBULTRhC2PWcyGTQBfwBNVX9SW2i",
    reverse: "RyRmCEVW4wq8xaRGh3sPvp2HDDzb3BgGGMavnXZrbWG",
  };
  const owner = new PublicKey("FSMFjujJ1Xi2CN424e4wfFsSMNcdYDGktsuxunazsnjd");

  ////////////////////////////////////////////////////////////////////////

  expect((await getTwitterRegistryKey(expected.handle)).toBase58()).toBe(
    expected.registry,
  );

  ////////////////////////////////////////////////////////////////////////

  const twitterRegistry = await getTwitterRegistry(connection, expected.handle);
  expect(twitterRegistry.class.toBase58()).toBe(PublicKey.default.toBase58());
  expect(twitterRegistry.parentName.toBase58()).toBe(
    TWITTER_ROOT_PARENT_REGISTRY_KEY.toBase58(),
  );
  expect(twitterRegistry.owner.toBase58()).toBe(owner.toBase58());

  ////////////////////////////////////////////////////////////////////////

  const reverse = await ReverseTwitterRegistryState.retrieve(
    connection,
    new PublicKey(expected.reverse),
  );
  expect(reverse.twitterHandle).toBe(expected.handle);
  expect(new PublicKey(reverse.twitterRegistryKey).toBase58()).toBe(
    expected.registry,
  );

  ////////////////////////////////////////////////////////////////////////

  let [handle, registry] = await getHandleAndRegistryKey(connection, owner);

  expect(handle).toBe(expected.handle);
  expect(registry.toBase58()).toBe(expected.registry);

  ////////////////////////////////////////////////////////////////////////

  [handle, registry] = await getTwitterHandleandRegistryKeyViaFilters(
    connection,
    owner,
  );
  expect(handle).toBe(expected.handle);
  expect(registry.toBase58()).toBe(expected.registry);
});

test("Create instruction", async () => {
  const tx = new Transaction();

  const handle = randomBytes(10).toString("hex");
  const user = Keypair.generate().publicKey;
  const payer = new PublicKey("FSMFjujJ1Xi2CN424e4wfFsSMNcdYDGktsuxunazsnjd");

  const ix = await createVerifiedTwitterRegistry(
    connection,
    handle,
    user,
    10,
    payer,
  );

  tx.add(...ix);

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});

test("Create & delete instruction", async () => {
  const tx = new Transaction();

  const handle = randomBytes(10).toString("hex");
  const user = Keypair.generate().publicKey;
  const payer = new PublicKey("FSMFjujJ1Xi2CN424e4wfFsSMNcdYDGktsuxunazsnjd");

  tx.add(
    ...(await createVerifiedTwitterRegistry(
      connection,
      handle,
      user,
      10,
      payer,
    )),
  );
  tx.add(...(await deleteTwitterRegistry(handle, user)));

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const { value } = await connection.simulateTransaction(tx);
  expect(value.err).toBe(null);
});
