import { Hono, Context } from "hono";
import {
  getDomainKeySync,
  resolve,
  getReverseKeySync,
  Record,
  getRecordKeySync,
  getRecord,
  reverseLookup,
  registerDomainNameV2,
  findSubdomains,
  getAllDomains,
  getFavoriteDomain,
  reverseLookupBatch,
  getTokenizedDomains,
  getRecords,
  RecordVersion,
  getTwitterRegistry,
  getHandleAndRegistryKey,
  getRecordV2,
  getMultipleRecordsV2,
  getMultipleFavoriteDomains,
  NameRegistryState,
  GUARDIANS,
  createSubdomain,
  transferInstruction,
  NAME_PROGRAM_ID,
} from "@bonfida/spl-name-service";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { Validation } from "@bonfida/sns-records";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface Env {
  RPC_URL: string;
}

const isPubkey = (x: string) => {
  try {
    new PublicKey(x);
    return true;
  } catch {
    return false;
  }
};

const booleanSchema = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true");

const getConnection = (c: Context<any>, clientRpc: string | undefined) => {
  return new Connection(clientRpc || (c.env?.RPC_URL as string), "processed");
};

function response<T>(success: boolean, result: T) {
  return { s: success ? "ok" : "error", result };
}

const app = new Hono();

app.use("*", logger());
app.use("/*", cors({ origin: "*" }));

app.get("/", async (c) => c.text("Visit https://github.com/Bonfida/sns-sdk"));

/**
 * Resolves to the current owner of the domain
 */
app.get("/resolve/:domain", async (c) => {
  const { domain } = c.req.param();
  const rpc = c.req.query("rpc");
  try {
    const res = await resolve(getConnection(c, rpc), domain);
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
    const Query = z.object({
      record: z.nativeEnum(RecordVersion).optional(),
    });
    const { record } = Query.parse(c.req.query());

    const res = getDomainKeySync(domain, record);
    return c.json(response(true, res.pubkey.toBase58()));
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns all the domains of the specified owner
 */
app.get("/domains/:owner", async (c) => {
  try {
    const { owner } = c.req.param();
    const rpc = c.req.query("rpc");
    const res = await getAllDomains(
      getConnection(c, rpc),
      new PublicKey(owner)
    );
    const revs = await reverseLookupBatch(getConnection(c, rpc), res);

    const tokenized = await getTokenizedDomains(
      getConnection(c, rpc),
      new PublicKey(owner)
    );

    return c.json(
      response(
        true,
        res
          .map((e, idx) => {
            return { key: e.toBase58(), domain: revs[idx] };
          })
          .concat(
            tokenized.map((e) => {
              return { key: e.key.toBase58(), domain: e.reverse };
            })
          )
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
    const Params = z.object({
      domain: z.string(),
      record: z.nativeEnum(Record),
    });
    const { domain, record } = Params.parse(c.req.param());
    const res = getRecordKeySync(domain, record);
    return c.json(response(true, res.toBase58()));
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns the base64 encoded content of a record for the specified domain
 */
app.get("/record/:domain/:record", async (c) => {
  try {
    const Query = z.object({
      domain: z.string(),
      record: z.nativeEnum(Record),
      rpc: z.string().optional(),
    });
    const { domain, record, rpc } = Query.parse(c.req.param());
    const res = await getRecord(getConnection(c, rpc), domain, record);
    return c.json(response(true, res?.data?.toString("base64")));
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns the base64 encoded content of a record for the specified domain
 */
app.get("/record-v2/:domain/:record", async (c) => {
  try {
    const Query = z.object({
      domain: z.string(),
      record: z.nativeEnum(Record),
      rpc: z.string().optional(),
    });
    const { domain, record, rpc } = Query.parse(c.req.param());
    const connection = getConnection(c, rpc);
    const { registry } = await NameRegistryState.retrieve(
      connection,
      getDomainKeySync(domain).pubkey
    );
    const owner = registry.owner;
    const res = await getRecordV2(connection, domain, record, {
      deserialize: true,
    });

    const stale = !res.retrievedRecord
      .getStalenessId()
      .equals(owner.toBuffer());

    let roa = undefined;

    if (Record.SOL === record) {
      roa =
        res.retrievedRecord
          .getRoAId()
          .equals(res.retrievedRecord.getContent()) &&
        res.retrievedRecord.header.rightOfAssociationValidation ===
          Validation.Solana;
    } else if (
      [Record.ETH, Record.BSC, Record.Injective, Record.BASE].includes(record)
    ) {
      roa =
        res.retrievedRecord
          .getRoAId()
          .equals(res.retrievedRecord.getContent()) &&
        res.retrievedRecord.header.rightOfAssociationValidation ===
          Validation.Ethereum;
    } else if ([Record.Url]) {
      const guardian = GUARDIANS.get(record);
      if (guardian) {
        roa =
          res.retrievedRecord.getRoAId().equals(guardian.toBuffer()) &&
          res.retrievedRecord.header.rightOfAssociationValidation ===
            Validation.Solana;
      }
    }

    return c.json(
      response(true, {
        deserialized: res.deserializedContent,
        stale,
        roa,
        record: {
          header: res.retrievedRecord.header,
          data: res.retrievedRecord.data.toString("base64"),
        },
      })
    );
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns the favorite domain for the specified owner and null if it does not exist
 */
app.get("/favorite-domain/:owner", async (c) => {
  try {
    const { owner } = c.req.param();
    const rpc = c.req.query("rpc");
    const res = await getFavoriteDomain(
      getConnection(c, rpc),
      new PublicKey(owner)
    );
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
 * Returns the favorite domain for the specified owners (comma separated) and undefined if it does not exist
 */
app.get("/multiple-favorite-domains/:owners", async (c) => {
  try {
    const { owners } = c.req.param();
    const rpc = c.req.query("rpc");
    const parsed = owners.split(",").map((e) => new PublicKey(e));
    const res = await getMultipleFavoriteDomains(getConnection(c, rpc), parsed);
    return c.json(response(true, res));
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
    const rpc = c.req.query("rpc");
    const res = await reverseLookup(
      getConnection(c, rpc),
      new PublicKey(pubkey)
    );
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
    const rpc = c.req.query("rpc");
    const subs = await findSubdomains(
      getConnection(c, rpc),
      getDomainKeySync(parent).pubkey
    );
    return c.json(response(true, subs));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

/**
 * Returns a list of deserialized records. The list of records passed by URL query param must be comma separated.
 * In the case where a record does not exist, the data will be undefined
 */
app.get("/records/:domain", async (c) => {
  try {
    const { domain } = c.req.param();
    const rpc = c.req.query("rpc");

    const parsedRecords = c.req.query("records")?.split(",");
    const recordSchema = z.array(z.nativeEnum(Record));
    const records = recordSchema.parse(parsedRecords);

    if (!records || records.length === 0) {
      return c.json(response(false, "Missing records in URL query params"));
    }

    const res = await getRecords(getConnection(c, rpc), domain, records);

    const result = res.map((e, idx) => {
      return { record: records[idx], data: e?.data?.toString("utf-8") };
    });
    return c.json(response(true, result));
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns a list of deserialized V2 records. The list of records passed by URL query param must be comma separated.
 * In the case where a record does not exist, the data will not be included in the result.
 */
app.get("/records-v2/:domain", async (c) => {
  try {
    const { domain } = c.req.param();
    const rpc = c.req.query("rpc");

    const parsedRecords = c.req.query("records")?.split(",");
    const recordSchema = z.array(z.nativeEnum(Record));
    const records = recordSchema.parse(parsedRecords);

    if (!records || records.length === 0) {
      return c.json(response(false, "Missing records in URL query params"));
    }

    const connection = getConnection(c, rpc);
    const { registry } = await NameRegistryState.retrieve(
      connection,
      getDomainKeySync(domain).pubkey
    );
    const owner = registry.owner;
    const results = [];

    const recordsV2 = await getMultipleRecordsV2(connection, domain, records, {
      deserialize: true,
    });

    for (const res of recordsV2) {
      if (res === undefined) break;

      const stale = !res.retrievedRecord
        .getStalenessId()
        .equals(owner.toBuffer());
      const { record } = res;
      let roa = undefined;

      if (Record.SOL === record) {
        roa =
          res.retrievedRecord
            .getRoAId()
            .equals(res.retrievedRecord.getContent()) &&
          res.retrievedRecord.header.rightOfAssociationValidation ===
          Validation.Solana;
      } else if ([
        Record.ETH,
        Record.BSC,
        Record.Injective,
        Record.BASE
      ].includes(record)) {
        roa =
          res.retrievedRecord
            .getRoAId()
            .equals(res.retrievedRecord.getContent()) &&
          res.retrievedRecord.header.rightOfAssociationValidation ===
          Validation.Ethereum;
      } else if ([Record.Url]) {
        const guardian = GUARDIANS.get(record);
        if (guardian) {
          roa =
            res.retrievedRecord.getRoAId().equals(guardian.toBuffer()) &&
            res.retrievedRecord.header.rightOfAssociationValidation ===
            Validation.Solana;
        }
      }

      results.push({
        type: res.record,
        deserialized: res.deserializedContent,
        stale,
        roa,
        record: {
          header: res.retrievedRecord.header,
          data: res.retrievedRecord.data.toString("base64"),
        },
      });
    };

    return c.json(response(true, results));
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns twitter handle
 */

app.get("/twitter/get-handle-by-key/:key", async (c) => {
  try {
    const { key } = c.req.param();
    const rpc = c.req.query("rpc");
    const connection = getConnection(c, rpc);
    const [handle] = await getHandleAndRegistryKey(
      connection,
      new PublicKey(key)
    );
    return c.json(response(true, handle));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Invalid input"));
  }
});

app.get("/twitter/get-key-by-handle/:handle", async (c) => {
  try {
    const { handle } = c.req.param();
    const rpc = c.req.query("rpc");
    const connection = getConnection(c, rpc);
    const registry = await getTwitterRegistry(connection, handle);
    return c.json(response(true, registry.owner.toBase58()));
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
    const Query = z.object({
      buyerStr: z.string().refine(isPubkey),
      domain: z.string(),
      space: z.number().min(0),
      serialize: booleanSchema.optional(),
      refKey: z.string().refine(isPubkey).optional(),
      mintStr: z.string().refine(isPubkey).optional(),
      rpc: z.string().optional(),
    });

    const { buyerStr, domain, space, serialize, refKey, mintStr, rpc } =
      Query.parse(c.req.query());

    const buyer = new PublicKey(buyerStr);
    const mint = new PublicKey(mintStr || USDC_MINT);

    const ata = await getAssociatedTokenAddress(mint, buyer, true);

    const connection = getConnection(c, rpc);

    const ixs = await registerDomainNameV2(
      connection,
      domain,
      space,
      buyer,
      ata,
      mint,
      refKey ? new PublicKey(refKey) : undefined
    );

    if (serialize) {
      const tx = new Transaction().add(...ixs);

      tx.feePayer = buyer;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const ser = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      return c.json(response(true, ser));
    }

    const result = [];
    for (let i of ixs) {
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
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns the base64 transaction to create a sub domain
 */
app.get("/create-sub", async (c) => {
  try {
    const Query = z.object({
      owner: z.string().refine(isPubkey),
      subdomain: z.string(),
      rpc: z.string().optional(),
      serialize: booleanSchema.optional(),
      finalOwner: z.string().refine(isPubkey).optional(),
    });

    const { owner, subdomain, rpc, serialize, finalOwner } = Query.parse(
      c.req.query()
    );

    const connection = getConnection(c, rpc);
    const ixs: TransactionInstruction[] = [];

    const ix = await createSubdomain(
      connection,
      subdomain,
      new PublicKey(owner),
      0
    );
    ixs.push(...ix);

    if (finalOwner) {
      const ix = transferInstruction(
        NAME_PROGRAM_ID,
        getDomainKeySync(subdomain).pubkey,
        new PublicKey(finalOwner),
        new PublicKey(owner)
      );
      ixs.push(ix);
    }

    if (serialize) {
      const tx = new Transaction().add(...ixs);

      tx.feePayer = new PublicKey(owner);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const ser = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      return c.json(response(true, ser));
    }

    const result = [];
    for (let i of ixs) {
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
    if (err instanceof z.ZodError) {
      return c.json(response(false, "Invalid input"), 400);
    } else {
      return c.json(response(false, "Internal error"), 500);
    }
  }
});

/**
 * Returns the base64 encoded data of a .sol domain
 */
app.get("/domain-data/:domain", async (c) => {
  try {
    const { domain } = c.req.param();
    const rpc = c.req.query("rpc");
    const connection = getConnection(c, rpc);

    const { pubkey: domainKey } = getDomainKeySync(domain);
    const info = await connection.getAccountInfo(domainKey);

    if (!info) {
      return c.json(response(false, "Domain not found"));
    }

    const base64Data = info.data.slice(96).toString("base64");

    return c.json(response(true, base64Data));
  } catch (err) {
    console.log(err);
    return c.json(response(false, "Error fetching domain data"));
  }
});

export default app;
