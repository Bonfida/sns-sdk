require("dotenv").config();
import { test, expect, jest } from "@jest/globals";
import { getFavoriteDomain } from "../src/favorite-domain";
import { PublicKey, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const items = [
  {
    user: new PublicKey("FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ"),
    favorite: {
      domain: new PublicKey("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb"),
      reverse: "bonfida",
      stale: true,
    },
  },
  {
    user: new PublicKey("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA"),
    favorite: {
      domain: new PublicKey("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb"),
      reverse: "bonfida",
      stale: false,
    },
  },
];

const connection = new Connection(process.env.RPC_URL!);

test("Favorite domain", async () => {
  for (let item of items) {
    const fav = await getFavoriteDomain(connection, item.user);

    expect(fav.domain.toBase58()).toBe(item.favorite.domain.toBase58());
    expect(fav.reverse).toBe(item.favorite.reverse);
    expect(fav.stale).toBe(item.favorite.stale);
  }
});
