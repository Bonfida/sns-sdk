import { test, jest, expect } from "@jest/globals";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { resolve } from "../src/resolve";

jest.setTimeout(50_000);

const connection = new Connection(clusterApiUrl("mainnet-beta"));

test("Resolve domains", async () => {
  // Resolve bonfida.sol
  // let domain = "🍍.sol";
  // let owner = await resolve(connection, domain);
  // expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");

  let domain = "beach";
  let owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");

  // domain = "boston.sol";
  // owner = await resolve(connection, domain);
  // expect(owner.toBase58()).toBe("HKKp49qGWXd639QsuH7JiLijfVW5UtCVY4s1n2HANwEA");

  // domain = "0x108.sol";
  // owner = await resolve(connection, domain);
  // expect(owner.toBase58()).toBe("J5TyWD7cozDdehGdjtrAF7sN5SVvqjfNCffKC6EgmRUU");

  domain = "10k-club.sol";
  owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");

  domain = "999-club.sol";
  owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");

  domain = "test.🇺🇸.sol";
  owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("69b4seiMKUNheQpLh1siLx7njQLN8LYmRRmLVPZgGAeM");
  domain = "nightly";
  owner = await resolve(connection, domain);
  console.log(owner.toBase58());
});
