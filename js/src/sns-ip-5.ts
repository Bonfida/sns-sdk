import { Connection, PublicKey } from "@solana/web3.js";
import { getDomainKeySync } from "./utils/getDomainKeySync";
import { NftRecord, Tag } from "./nft/state";
import { NAME_TOKENIZER_ID } from "./nft/const";
import { getRecordKeySync } from "./record/getRecordKeySync";
import { Record } from "record";
import { getRecordV2Key } from "./record_v2/getRecordV2Key";
import { Record as RecordV2 } from "@bonfida/sns-records";
import {
  DomainDoesNotExist,
  InvalidRoAError,
  PdaOwnerNotAllowed,
  RecordMalformed,
} from "./error";
import { NameRegistryState } from "./state";
import { checkSolRecord } from "./record/checkSolRecord";

type AllowPda = "any" | boolean;

type ResolveConfig = AllowPda extends true
  ? {
      allowPda: true;
      programIds: PublicKey[];
    }
  : {
      allowPda: AllowPda;
      programIds?: PublicKey[];
    };

/**
 * Resolve function according to SNS-IP 5
 * @param connection
 * @param domain
 * @param config
 * @returns
 */
export const resolve = async (
  connection: Connection,
  domain: string,
  config: ResolveConfig = { allowPda: false },
) => {
  const { pubkey } = getDomainKeySync(domain);
  const [nftRecordKey] = NftRecord.findKeySync(pubkey, NAME_TOKENIZER_ID);
  const solRecordV1Key = getRecordKeySync(domain, Record.SOL);
  const solRecordV2Key = getRecordV2Key(domain, Record.SOL);
  const [nftRecordInfo, solRecordV1Info, solRecordV2Info, registryInfo] =
    await connection.getMultipleAccountsInfo([
      nftRecordKey,
      solRecordV1Key,
      solRecordV2Key,
      pubkey,
    ]);

  if (!registryInfo?.data) {
    throw new DomainDoesNotExist(`Domain ${domain} does not exist`);
  }

  const registry = NameRegistryState.deserialize(registryInfo.data);

  // If NFT record active -> NFT owner is the owner
  if (nftRecordInfo?.data) {
    const nftRecord = NftRecord.deserialize(nftRecordInfo.data);
    if (nftRecord.tag === Tag.ActiveRecord) {
      return; // Whoever owns the NFT
    }
  }

  // Check SOL record V2
  recordV2: if (solRecordV2Info?.data) {
    const recordV2 = RecordV2.deserialize(solRecordV2Info.data);
    const stalenessId = recordV2.getStalenessId();
    const roaId = recordV2.getRoAId();
    const content = recordV2.getContent();

    if (content.length !== 32) {
      throw new RecordMalformed(`Record is malformed`);
    }

    if (!stalenessId.equals(registry.owner.toBuffer())) {
      break recordV2;
    }

    if (roaId.equals(content)) {
      return new PublicKey(content);
    }

    throw new InvalidRoAError(
      `The RoA ID shoudl be ${new PublicKey(
        content,
      ).toBase58()} but is ${new PublicKey(roaId).toBase58()} `,
    );
  }

  // Check SOL record V1
  if (solRecordV1Info?.data) {
    const encoder = new TextEncoder();
    const expectedBuffer = Buffer.concat([
      solRecordV1Info.data.slice(0, 32),
      solRecordV1Key.toBuffer(),
    ]);
    const expected = encoder.encode(expectedBuffer.toString("hex"));
    const valid = checkSolRecord(
      expected,
      solRecordV1Info.data.slice(32),
      registry.owner,
    );
    if (valid) {
      return new PublicKey(solRecordV1Info.data.slice(0, 32));
    }
  }

  // Check if the registry owner is a PDA
  const isOnCurve = PublicKey.isOnCurve(registry.owner);
  if (!isOnCurve && config.allowPda === "any") {
    return registry.owner;
  } else if (!isOnCurve && config.allowPda) {
    const ownerInfo = await connection.getAccountInfo(registry.owner);
    const isAllowed = config.programIds?.some(
      (e) => ownerInfo?.owner?.equals(e),
    );

    if (isAllowed) {
      return registry.owner;
    }

    throw new PdaOwnerNotAllowed(
      `The Program ${ownerInfo?.owner.toBase58()} is not allowed`,
    );
  }

  return registry.owner;
};
