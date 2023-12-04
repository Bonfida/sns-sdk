require("dotenv").config();
import { test, jest, expect } from "@jest/globals";
import { reverseLookupBatch, reverseLookup } from "../src/utils";
import { Connection, PublicKey } from "@solana/web3.js";
import { performReverseLookupBatch } from "../src/deprecated/utils";

jest.setTimeout(5_000);

const connection = new Connection(process.env.RPC_URL!);
const domain = new PublicKey("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");

test("Reverse lookup", async () => {
  performReverseLookupBatch(connection, [domain]).then((e) =>
    expect(e).toStrictEqual(["bonfida"])
  );
  reverseLookupBatch(connection, [domain]).then((e) =>
    expect(e).toStrictEqual(["bonfida"])
  );
  reverseLookup(connection, domain).then((e) => expect(e).toBe("bonfida"));
});
