import { Hono, Context } from "hono";
import {
  getDomainKeySync,
  resolve,
  getReverseKeySync,
  Record,
  getRecordKeySync,
  getRecord,
  reverseLookup,
  registerDomainName,
  findSubdomains,
  getAllDomains,
  getFavoriteDomain,
} from "@bonfida/spl-name-service";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface Env {
  RPC_URL: string;
}

const getConnection = (c: Context<any>) => {
  return new Connection(c.env?.RPC_URL as string);
};

function response<T>(success: boolean, result: T) {
  return { s: success ? "ok" : "error", result };
}

const app = new Hono();

app.get("/", async (c) => c.text("Visit https://github.com/Bonfida/sns-sdk"));

/**
 * Resolves to the current owner of the domain
 */
app.get("/resolve/:domain", async (c) => {
  const { domain } = c.req.param();
  try {
    const res = await resolve(getConnection(c), domain);
    return c.json(response(true, res));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Domain not found"));
  }
});

/**
 * Returns the public key of a domain
 */
app.get("/domain-key/:domain", (c) => {
  try {
    const { domain } = c.req.param();
    const query = c.req.query("record");
    const res = getDomainKeySync(domain, query === "true");
    return c.json(response(true, res.pubkey.toBase58()));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid domain input"));
  }
});

/**
 * Returns all the domains of the specified owner
 */
app.get("/domains/:owner", async (c) => {
  try {
    const { owner } = c.req.param();
    const res = await getAllDomains(getConnection(c), new PublicKey(owner));
    return c.json(
      response(
        true,
        res.map((e) => e.toBase58())
      )
    );
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid domain input"));
  }
});

/**
 * Returns the public key of the reverse account for the specified domain
 */
app.get("/reverse-key/:domain", (c) => {
  try {
    const { domain } = c.req.param();
    const query = c.req.query("sub");
    const res = getReverseKeySync(domain, query === "true");
    return c.json(response(true, res.toBase58()));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid domain input"));
  }
});

/**
 * Returns the public key of the record for the specified domain
 */
app.get("/record-key/:domain/:record", (c) => {
  try {
    const { domain, record } = c.req.param();
    const res = getRecordKeySync(domain, record as Record);
    return c.json(response(true, res.toBase58()));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

/**
 * Returns the base64 encoded content of a record for the specified domain
 */
app.get("/record/:domain/:record", async (c) => {
  try {
    const { domain, record } = c.req.param();
    const res = await getRecord(getConnection(c), domain, record as Record);
    return c.json(response(true, res.data?.toString("base64")));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

/**
 * Returns the favorite domain for the specified owner and null if it does not exist
 */
app.get("/favorite-domain/:owner", async (c) => {
  try {
    const { owner } = c.req.param();
    const res = await getFavoriteDomain(getConnection(c), new PublicKey(owner));
    return c.json(
      response(true, { domain: res.domain.toBase58(), reverse: res.reverse })
    );
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      if (err.message.includes("Favourite domain not found")) {
        return c.json(response(true, null));
      }
    }
    return c.json(response(false, "Invalid domain input"));
  }
});

/**
 * Returns the list of supported records
 */
app.get("/types/record", (c) => {
  return c.json(response(true, Record));
});

/**
 * Returns the reverse domain for the specified public key
 */
app.get("/reverse-lookup/:pubkey", async (c) => {
  try {
    const { pubkey } = c.req.param();
    const res = reverseLookup(getConnection(c), new PublicKey(pubkey));
    return c.json(response(true, res));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

/**
 * Returns the subdomains for the specified parent
 */
app.get("/subdomains/:parent", async (c) => {
  try {
    const { parent } = c.req.param();
    const subs = await findSubdomains(
      getConnection(c),
      getDomainKeySync(parent).pubkey
    );
    return c.json(response(true, subs));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

////////////////////////////////////////////////////////////////
// Instruction
////////////////////////////////////////////////////////////////

/**
 * Returns the base64 transaction to register a domain
 */
app.get("/register", async (c) => {
  try {
    const buyerStr = c.req.query("buyer");
    const domain = c.req.query("domain");
    const space = c.req.query("space");
    const serialize = c.req.query("serialize");
    const refKey = c.req.query("referrerKey");
    const mint = c.req.query("mint") || USDC_MINT;

    if (!buyerStr || !domain || !space) {
      return c.json(response(false, "Missing input"));
    }

    const buyer = new PublicKey(buyerStr);

    const ata = await getAssociatedTokenAddress(
      new PublicKey(USDC_MINT),
      buyer,
      true
    );

    const connection = getConnection(c);

    const [, ix] = await registerDomainName(
      connection,
      domain,
      parseInt(space),
      buyer,
      ata,
      new PublicKey(mint),
      refKey ? new PublicKey(refKey) : undefined
    );

    if (serialize === "true") {
      const tx = new Transaction().add(...ix);

      tx.feePayer = buyer;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const ser = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      return c.json(response(true, ser));
    }

    const result = [];
    for (let i of ix) {
      result.push({
        programId: i.programId.toBase58(),
        keys: i.keys.map((e) => {
          return {
            isSigner: e.isSigner,
            isWritable: e.isWritable,
            pubkey: e.pubkey.toBase58(),
          };
        }),
        data: i.data.toString("base64"),
      });
    }

    return c.json(response(true, result));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

export default app;
