require("dotenv").config();
import { test, expect, jest } from "@jest/globals";
import { getAllRegisteredDomains } from "../src/utils";
import { Connection } from "@solana/web3.js";

jest.setTimeout(4 * 60_000);

const connection = new Connection(process.env.RPC_URL!);

test("All registered", async () => {
  const registered = await getAllRegisteredDomains(connection);
  expect(registered.length).toBeGreaterThan(130_000);
});
