import {
  PublicKey,
  Connection,
  GetProgramAccountsFilter,
  MemcmpFilter,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, RawAccount, AccountLayout } from "@solana/spl-token";
import { NftRecord } from "./state";
import { getRecordFromMint } from "./getRecordFromMint";

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

export const retrieveRecords = async (
  connection: Connection,
  owner: PublicKey,
) => {
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
