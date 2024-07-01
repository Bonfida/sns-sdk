import { Connection } from "@solana/web3.js";
import { Record } from "../../types/record";
import { getRecord } from "../getRecord";

/**
 * This function can be used to retrieve the pic record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export const getPicRecord = (connection: Connection, domain: string) => {
  return getRecord(connection, domain, Record.Pic, true);
};
