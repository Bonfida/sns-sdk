import {
  PublicKey,
  Connection,
  GetProgramAccountsFilter,
  MemcmpFilter,
} from "@solana/web3.js";
import {
  getMint,
  TOKEN_PROGRAM_ID,
  RawAccount,
  AccountLayout,
} from "@solana/spl-token";
import {
  NAME_TOKENIZER_ID,
  MINT_PREFIX,
  NftRecord,
  getRecordFromMint,
} from "./name-tokenizer";
import { reverseLookupBatch } from "../utils";

/**
 * This function can be used to retrieve the owner of a tokenized domain name
 *
 * @param connection The solana connection object to the RPC node
 * @param nameAccount The key of the domain name
 * @returns
 */
export const retrieveNftOwner = async (
  connection: Connection,
  nameAccount: PublicKey
) => {
  try {
    const [mint] = await PublicKey.findProgramAddress(
      [MINT_PREFIX, nameAccount.toBuffer()],
      NAME_TOKENIZER_ID
    );

    const mintInfo = await getMint(connection, mint);
    if (mintInfo.supply.toString() === "0") {
      return undefined;
    }

    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          offset: 0,
          bytes: mint.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 64,
          bytes: "2",
        },
      },
      { dataSize: 165 },
    ];

    const result = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters,
    });

    if (result.length != 1) {
      return undefined;
    }

    return new PublicKey(result[0].account.data.slice(32, 64));
  } catch {
    return undefined;
  }
};

/**
 * This function can be used to retrieve all the tokenized domains name
 *
 * @param connection The solana connection object to the RPC node
 * @returns
 */
export const retrieveNfts = async (connection: Connection) => {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: "3",
      },
    },
  ];

  const result = await connection.getProgramAccounts(NAME_TOKENIZER_ID, {
    filters,
  });
  const offset = 1 + 1 + 32 + 32;
  return result.map(
    (e) => new PublicKey(e.account.data.slice(offset, offset + 32))
  );
};

const getFilter = (owner: string) => {
  const filters: MemcmpFilter[] = [
    {
      memcmp: { offset: 32, bytes: owner },
    },
    { memcmp: { offset: 64, bytes: "2" } },
  ];
  return filters;
};

const closure = async (connection: Connection, acc: RawAccount) => {
  const record = await getRecordFromMint(connection, acc.mint);
  if (record.length === 1) {
    return NftRecord.deserialize(record[0].account.data);
  }
};

const retrieveRecords = async (connection: Connection, owner: PublicKey) => {
  const filters: GetProgramAccountsFilter[] = [
    ...getFilter(owner.toBase58()),
    { dataSize: 165 },
  ];
  const result = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters,
  });

  const tokenAccs = result.map((e) => AccountLayout.decode(e.account.data));

  const promises = tokenAccs.map((acc) => closure(connection, acc));
  const records = await Promise.all(promises);

  return records.filter((e) => e !== undefined) as NftRecord[];
};

/**
 * This function can be used to retrieve all the tokenized domains of an owner
 * @param connection The Solana RPC connection object
 * @param owner The owner of the tokenized domains
 * @returns
 */
export const getTokenizedDomains = async (
  connection: Connection,
  owner: PublicKey
) => {
  const nftRecords = await retrieveRecords(connection, owner);

  const names = await reverseLookupBatch(
    connection,
    nftRecords.map((e) => e.nameAccount)
  );

  return names
    .map((e, idx) => {
      return {
        key: nftRecords[idx].nameAccount,
        mint: nftRecords[idx].nftMint,
        reverse: e,
      };
    })
    .filter((e) => !!e.reverse);
};
