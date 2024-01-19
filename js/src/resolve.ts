import { Connection, PublicKey } from "@solana/web3.js";
import { getRecordKeySync, getSolRecord, checkSolRecord } from "./record";
import { getDomainKeySync } from "./utils";
import { NameRegistryState } from "./state";
import { Record } from "./types/record";
import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";
import { getRecordV2Key } from "./record_v2";
import { Record as SnsRecord, Validation } from "@bonfida/sns-records";

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
    pubkey,
  );

  if (nftOwner) {
    return nftOwner;
  }

  try {
    /**
     * Handle SOL record V2
     */
    const solV2Owner = await resolveSolRecordV2(
      connection,
      registry.owner,
      domain,
    );
    if (solV2Owner !== undefined) {
      return solV2Owner;
    }

    /**
     * Handle SOL record v1
     */
    const solV1Owner = await resolveSolRecordV1(
      connection,
      registry.owner,
      domain,
    );

    return solV1Owner;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "FetchError") {
        throw err;
      }
    }
  }

  return registry.owner;
};

export const resolveSolRecordV1 = async (
  connection: Connection,
  owner: PublicKey,
  domain: string,
) => {
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
  const valid = checkSolRecord(expected, solRecord.data.slice(32), owner);

  if (!valid) {
    throw new SNSError(ErrorType.InvalidSignature);
  }

  return new PublicKey(solRecord.data.slice(0, 32));
};

export const resolveSolRecordV2 = async (
  connection: Connection,
  owner: PublicKey,
  domain: string,
) => {
  try {
    const recordV2Key = getRecordV2Key(domain, Record.SOL);
    const solV2Record = await SnsRecord.retrieve(connection, recordV2Key);
    const stalenessId = solV2Record.getStalenessId();
    const roaId = solV2Record.getRoAId();
    const content = solV2Record.getContent();

    if (
      // The record must signed by the current owner
      stalenessId.compare(owner.toBuffer()) === 0 &&
      solV2Record.header.stalenessValidation === Validation.Solana &&
      // The record must signed by the destination
      roaId.compare(content) === 0 &&
      solV2Record.header.rightOfAssociationValidation === Validation.Solana
    ) {
      return new PublicKey(content);
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "FetchError") {
        throw err;
      }
    }
  }
};
