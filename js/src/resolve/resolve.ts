import { Connection } from "@solana/web3.js";
import { getDomainKeySync } from "../utils/getDomainKeySync";
import { NameRegistryState } from "../state";

import { resolveSolRecordV1 } from "./resolveSolRecordV1";
import { resolveSolRecordV2 } from "./resolveSolRecordV2";

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
