import { Connection } from "@solana/web3.js";
import { Record } from "../../types/record";
import { getRecord } from "../getRecord";

/**
 * This function can be used to deserialize the content of a record. If the content is invalid it will throw an error
 * This function can be used to retrieve the Background record (V1) of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getBackgroundRecord = (connection: Connection, domain: string) => {
  return getRecord(connection, domain, Record.Background, true);
};
