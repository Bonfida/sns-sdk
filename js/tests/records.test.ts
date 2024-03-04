require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import * as record from "../src/record";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Record } from "../src/types/record";
import { createRecordInstruction } from "../src/bindings";
import { resolveSolRecordV1 } from "../src/resolve";
import { NameRegistryState } from "../src/state";
import { getRecordKeySync } from "../src/record";

jest.setTimeout(20_000);

const connection = new Connection(process.env.RPC_URL!);

test("Records", async () => {
  const domain = "🍍";
  record.getIpfsRecord(connection, domain).then((e) => {
    expect(e).toBe("QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR");
  });

  record
    .getArweaveRecord(connection, domain)
    .then((e) => expect(e).toBe("some-arweave-hash"));

  record
    .getEthRecord(connection, domain)
    .then((e) => expect(e).toBe("0x570eDC13f9D406a2b4E6477Ddf75D5E9cCF51cd6"));

  record
    .getBtcRecord(connection, domain)
    .then((e) => expect(e).toBe("3JfBcjv7TbYN9yQsyfcNeHGLcRjgoHhV3z"));

  record
    .getLtcRecord(connection, domain)
    .then((e) => expect(e).toBe("MK6deR3Mi6dUsim9M3GPDG2xfSeSAgSrpQ"));

  record
    .getDogeRecord(connection, domain)
    .then((e) => expect(e).toBe("DC79kjg58VfDZeMj9cWNqGuDfYfGJg9DjZ"));

  record
    .getEmailRecord(connection, domain)
    .then((e) => expect(e).toBe("🍍@gmail.com"));

  record.getUrlRecord(connection, domain).then((e) => expect(e).toBe("🍍.io"));

  record
    .getDiscordRecord(connection, domain)
    .then((e) => expect(e).toBe("@🍍#7493"));

  record
    .getGithubRecord(connection, domain)
    .then((e) => expect(expect(e).toBe("@🍍_dev")));

  record
    .getRedditRecord(connection, domain)
    .then((e) => expect(e).toBe("@reddit-🍍"));

  record
    .getTwitterRecord(connection, domain)
    .then((e) => expect(e).toBe("@🍍"));

  return record
    .getTelegramRecord(connection, domain)
    .then((e) => expect(e).toBe("@🍍-tg"));
});

const sub = "test.🇺🇸.sol";

test("Sub records", async () => {
  record
    .getEmailRecord(connection, sub)
    .then((e) => expect(e).toBe("test@test.com"));
});

test("Get multiple records", async () => {
  const records = await record.getRecords(
    connection,
    "🍍",
    [Record.Telegram, Record.Github, Record.Backpack],
    true,
  );
  expect(records[0]).toBe("@🍍-tg");
  expect(records[1]).toBe("@🍍_dev");
  expect(records[2]).toBe(undefined);
});

test("BSC", async () => {
  const res = await record.getBscRecord(connection, "aanda.sol");
  expect(res).toBe("0x4170ad697176fe6d660763f6e4dfcf25018e8b63");
});

test("Create", async () => {
  const domain = "wallet-guide-3.sol";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  let ix = await createRecordInstruction(
    connection,
    domain,
    Record.A,
    "192.168.0.1",
    owner,
    owner,
  );
  const tx = new Transaction().add(ix);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = owner;

  let res = await connection.simulateTransaction(tx);
  expect(res.value.err).toBe(null);
});

test("Check sol record", async () => {
  const domain = "wallet-guide-4";
  const owner = new PublicKey("Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8");
  const result = await resolveSolRecordV1(connection, owner, domain);
  expect(result.toBase58()).toBe(
    "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
  );
});

test("Des/ser", () => {
  const items = [
    { content: "this is a test", record: Record.TXT },
    {
      content: "inj13glcnaum2xqv5a0n0hdsmv0f6nfacjsfvrh5j9",
      record: Record.Injective,
    },
    {
      content: "example.com",
      record: Record.CNAME,
    },
    {
      content: "example.com",
      record: Record.CNAME,
    },
    {
      content: "0xc0ffee254729296a45a3885639ac7e10f9d54979",
      record: Record.ETH,
    },
    {
      content: "1.1.1.4",
      record: Record.A,
    },
    {
      content: "2345:425:2ca1::567:5673:23b5",
      record: Record.AAAA,
    },
    {
      content: "username",
      record: Record.Discord,
    },
  ];

  items.forEach((e) => {
    const ser = record.serializeRecord(e.content, e.record);
    const registry: NameRegistryState = {
      data: ser,
      parentName: PublicKey.default,
      class: PublicKey.default,
      owner: PublicKey.default,
    };
    const des = record.deserializeRecord(registry, e.record, PublicKey.default);
    expect(des).toBe(e.content);
  });
});

describe("getRecordKeySync", () => {
  test.each([
    {
      domain: "domain1.sol",
      record: Record.SOL,
      expected: "ATH9akc5pi1PWDB39YY7VCoYzCxmz8XVj23oegSoNSPL",
    },
    {
      domain: "sub.domain2.sol",
      record: Record.SOL,
      expected: "AEgJVf6zaQfkyYPnYu8Y9Vxa1Sy69EtRSP8iGubx5MnC",
    },
    {
      domain: "domain3.sol",
      record: Record.Url,
      expected: "EuxtWLCKsdpwM8ftKjnD2Q8vBdzZunh7DY1mHwXhLTqx",
    },
    {
      domain: "sub.domain4.sol",
      record: Record.Url,
      expected: "64nv6HSbifdUgdWst48V4YUB3Y3uQXVQRD4iDZPd9qGx",
    },
    {
      domain: "domain5.sol",
      record: Record.IPFS,
      expected: "2uRMeYzKXaYgFVQ1Yh7fKyZWcxsFUMgpEwMi19sVjwjk",
    },
    {
      domain: "sub.domain6.sol",
      record: Record.IPFS,
      expected: "61JdnEhbd2bEfxnu2uQ38gM2SUry2yY8kBMEseYh8dDy",
    },
  ])("$domain", (e) => {
    expect(getRecordKeySync(e.domain, e.record).toBase58()).toBe(e.expected);
  });
});
