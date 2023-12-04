require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import { Connection } from "@solana/web3.js";
import { resolve } from "../src/resolve";

jest.setTimeout(50_000);

const connection = new Connection(process.env.RPC_URL!);

const LIST = [
  {
    domain: "wallet-guide-5.sol",
    owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
  },
  {
    domain: "wallet-guide-4.sol",
    owner: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
  },
  {
    domain: "wallet-guide-3.sol",
    owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
  },
  {
    domain: "wallet-guide-2.sol",
    owner: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4",
  },
  {
    domain: "wallet-guide-1.sol",
    owner: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4",
  },
  {
    domain: "wallet-guide-0.sol",
    owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
  },
  {
    domain: "sub-0.wallet-guide-3.sol",
    owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
  },
  {
    domain: "sub-1.wallet-guide-3.sol",
    owner: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
  },
];

test("Resolve domains", async () => {
  for (let x of LIST) {
    const owner = await resolve(connection, x.domain);
    expect(x.owner).toBe(owner.toBase58());
  }
});

test("Resolve domains record V2", async () => {
  // 223399 -> J6QDztZCegYTWnGUYtjqVS9d7AZoS43UbEQmMcdGeP5s
  let owner = await resolve(connection, "223399");
  expect(owner.toBase58()).toBe("J6QDztZCegYTWnGUYtjqVS9d7AZoS43UbEQmMcdGeP5s");
  // 10426871 -> 3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1 (RoA unsigned)
  owner = await resolve(connection, "10426871");
  expect(owner.toBase58()).toBe("3ogYncmMM5CmytsGCqKHydmXmKUZ6sGWvizkzqwT7zb1");
  // 2022222 -> (RoA signed & stale)
  owner = await resolve(connection, "2022222");
  expect(owner.toBase58()).toBe("J6QDztZCegYTWnGUYtjqVS9d7AZoS43UbEQmMcdGeP5s");
});
