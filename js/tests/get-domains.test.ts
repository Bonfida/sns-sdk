import { test, expect, jest } from "@jest/globals";
import { getAllDomains } from "../src/utils";
import { PublicKey, clusterApiUrl, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const items = [
  {
    user: new PublicKey("FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ"),
    domain: [new PublicKey("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb")],
  },
];

const connection = new Connection(clusterApiUrl("mainnet-beta"));

test("Get domains", async () => {
  for (let item of items) {
    const domains = await getAllDomains(connection, item.user);
    expect(item.domain).toStrictEqual(domains);
  }
});
