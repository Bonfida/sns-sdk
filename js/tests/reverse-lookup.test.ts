import { test, jest, expect } from "@jest/globals";
import {
  performReverseLookupBatch,
  reverseLookupBatch,
  reverseLookup,
} from "../src/utils";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

jest.setTimeout(5_000);

const connection = new Connection(clusterApiUrl("mainnet-beta"));
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
