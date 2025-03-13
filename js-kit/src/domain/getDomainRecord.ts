// import {
//   GetAccountInfoApi,
//   GetTokenLargestAccountsApi,
//   ReadonlyUint8Array,
//   Rpc,
// } from "@solana/kit";

// import { RecordState } from "../states/record";
// import { Record } from "../types/record";
// import { deserializeRecordContent } from "../utils/deserializeRecordContent";
// import { getRecordV2Address } from "../utils/getRecordV2Address";
// import {
//   _getDefaultVerifier,
//   _verifyRoaSync,
// } from "../utils/verifyRecordRightOfAssociation";
// import { _verifyStalenessSync } from "../utils/verifyRecordStaleness";
// import { getDomainOwner } from "./getDomainOwner";

// interface GetRecordV2Options {
//   deserialize?: boolean;
//   verifier?: ReadonlyUint8Array;
// }

// interface Result {
//   retrievedRecord: RecordState;
//   verified: {
//     staleness: boolean;
//     roa?: boolean;
//   };
//   deserializedContent?: string;
// }

// export async function getDomainRecord(
//   rpc: Rpc<GetAccountInfoApi & GetTokenLargestAccountsApi>,
//   domain: string,
//   record: Record,
//   options: GetRecordV2Options = {}
// ): Promise<Result> {
//   const [domainOwner, retrievedRecord] = await Promise.all([
//     getDomainOwner(rpc, domain),
//     getRecordV2Address(domain, record).then((address) =>
//       RecordState.retrieve(rpc, address)
//     ),
//   ]);

//   const verifier =
//     options.verifier || _getDefaultVerifier(record, retrievedRecord);
//   const verified = {
//     staleness: await _verifyStalenessSync(domainOwner, retrievedRecord),
//     ...(verifier && {
//       rightOfAssociation: _verifyRoaSync(record, retrievedRecord, verifier),
//     }),
//   };

//   return {
//     retrievedRecord,
//     verified,
//     ...(options.deserialize && {
//       deserializedContent: deserializeRecordContent(
//         retrievedRecord.getContent(),
//         record
//       ),
//     }),
//   };
// }
