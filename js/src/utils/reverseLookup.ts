import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "../state";
import { NoAccountDataError } from "../error";
import { deserializeReverse } from "./deserializeReverse";
import { getReverseKeyFromDomainKey } from "./getReverseKeyFromDomainKey";

/**
 * This function can be used to perform a reverse look up
 * @param connection The Solana RPC connection
 * @param nameAccount The public key of the domain to look up
 * @returns The human readable domain name
 */
export async function reverseLookup(
  connection: Connection,
  nameAccount: PublicKey,
  parent?: PublicKey,
): Promise<string> {
  const reverseKey = getReverseKeyFromDomainKey(nameAccount, parent);

  const { registry } = await NameRegistryState.retrieve(connection, reverseKey);
  if (!registry.data) {
    throw new NoAccountDataError("The registry data is empty");
  }

  return deserializeReverse(registry.data, !!parent);
}
