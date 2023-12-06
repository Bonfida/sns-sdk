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

  // Record V2
  {
    domain: "wallet-guide-6",
    owner: "Hf4daCT4tC2Vy9RCe9q8avT68yAsNJ1dQe6xiQqyGuqZ",
  },
  {
    domain: "wallet-guide-7",
    owner: "Fxuoy3gFjfJALhwkRcuKjRdechcgffUApeYAfMWck6w8",
  },
  {
    domain: "wallet-guide-8",
    owner: "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4",
  },
];

test("Resolve domains", async () => {
  for (let x of LIST) {
    const owner = await resolve(connection, x.domain);
    expect(x.owner).toBe(owner.toBase58());
  }
});
