import { Connection, PublicKey } from "@solana/web3.js";
import { Record } from "../types/record";
import { getRecordV2Key } from "../record_v2/getRecordV2Key";
import { Record as SnsRecord, Validation } from "@bonfida/sns-records";

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
