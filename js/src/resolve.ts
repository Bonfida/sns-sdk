import { Connection, PublicKey } from "@solana/web3.js";
import { getRecordKeySync, getSolRecord, checkSolRecord } from "./record";
import { getDomainKeySync } from "./utils";
import { NameRegistryState } from "./state";
import { Record } from "./types/record";
import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";

/**
 * This function can be used to resolve a domain name to transfer funds
 * @param connection The Solana RPC connection object
 * @param domain The domain to resolve
 * @returns
 */
export const resolve = async (connection: Connection, domain: string) => {
  const { pubkey } = getDomainKeySync(domain);

  const { registry, nftOwner } = await NameRegistryState.retrieve(
    connection,
    pubkey
  );

  if (nftOwner) {
    return nftOwner;
  }

  try {
    const recordKey = getRecordKeySync(domain, Record.SOL);
    const solRecord = await getSolRecord(connection, domain);

    if (!solRecord?.data) {
      throw new SNSError(ErrorType.NoRecordData);
    }

    const encoder = new TextEncoder();
    const expectedBuffer = Buffer.concat([
      solRecord.data.slice(0, 32),
      recordKey.toBuffer(),
    ]);
    const expected = encoder.encode(expectedBuffer.toString("hex"));

    const valid = checkSolRecord(
      expected,
      solRecord.data.slice(32),
      registry.owner
    );

    if (!valid) {
      throw new SNSError(ErrorType.InvalidSignature);
    }

    return new PublicKey(solRecord.data.slice(0, 32));
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "FetchError") {
        throw err;
      }
    }
  }

  return registry.owner;
};
