import { test, expect, jest } from "@jest/globals";
import { getFavoriteDomain } from "../src/favorite-domain";
import { PublicKey, clusterApiUrl, Connection } from "@solana/web3.js";

jest.setTimeout(10_000);

const items = [
  {
    user: new PublicKey("FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ"),
    favorite: {
      domain: new PublicKey("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb"),
      reverse: "bonfida",
    },
  },
];

const connection = new Connection(clusterApiUrl("mainnet-beta"));

test("Favorite domain", async () => {
  for (let item of items) {
    const fav = await getFavoriteDomain(connection, item.user);

    expect(fav.domain.toBase58()).toBe(item.favorite.domain.toBase58());
    expect(fav.reverse).toBe(item.favorite.reverse);
  }
});
