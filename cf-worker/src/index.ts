export interface Env {
  RPC_URL: string;
}
import { Hono, Context } from "hono";
import { getDomainKey, resolve } from "@bonfida/spl-name-service";
import { Connection } from "@solana/web3.js";

const getConnection = (c: Context<any>) => {
  return new Connection(c.env?.RPC_URL as string);
};

function response<T>(success: boolean, result: T) {
  return { s: success ? "ok" : "error", result };
}

const app = new Hono();

app.get("/", async (c) => c.text("Visit https://..."));

app.get("/resolve/:domain", async (c) => {
  const { domain } = c.req.param();
  try {
    const res = await resolve(getConnection(c), domain);
    return c.json(response(true, res));
  } catch (err) {
    return c.json(response(false, "Domain not found"));
  }
});

app.get("/domain-key/:domain", async (c) => {
  try {
    const { domain } = c.req.param();
    const query = c.req.query("record");
    const res = await getDomainKey(domain, query === "true");
    return c.json(response(true, res.pubkey.toBase58()));
  } catch (err) {
    return c.json(response(false, "Invalid domain input"));
  }
});

app.get("/all-domains/:owner", async () => {});

app.get("/reverse-key", async () => {});

app.get("/record-key/:domain/:record", async () => {});

app.get("/record/:domain/:record", async () => {});

app.get("/favorite-domain/:domain/:record", async () => {});

app.get("/constants");

app.get("/types/record", async () => {});

app.get("/reverse-lookup/:pubkey", async () => {});

app.get("/subdomains/:parentKey", async () => {});

// Instruction

app.get("/register/:domain", async () => {});

export default app;
