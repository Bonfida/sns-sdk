import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  NAME_PROGRAM_ID,
  TWITTER_VERIFICATION_AUTHORITY,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "./constants";
import { deleteNameRegistry } from "./bindings";
import {
  createInstruction,
  deleteInstruction,
  transferInstruction,
  updateInstruction,
} from "./instructions";
import { NameRegistryState } from "./state";
import { getHashedNameSync, getNameAccountKeySync } from "./utils";
import { Numberu32, Numberu64 } from "./int";
import { deserializeUnchecked, Schema, serialize } from "borsh";
import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";

////////////////////////////////////////////////////
// Bindings

// Signed by the authority, the payer and the verified pubkey
export async function createVerifiedTwitterRegistry(
  connection: Connection,
  twitterHandle: string,
  verifiedPubkey: PublicKey,
  space: number, // The space that the user will have to write data into the verified registry
  payerKey: PublicKey,
): Promise<TransactionInstruction[]> {
  // Create user facing registry
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const lamports = await connection.getMinimumBalanceForRentExemption(
    space + NameRegistryState.HEADER_LEN,
  );

  let instructions = [
    createInstruction(
      NAME_PROGRAM_ID,
      SystemProgram.programId,
      twitterHandleRegistryKey,
      verifiedPubkey,
      payerKey,
      hashedTwitterHandle,
      new Numberu64(BigInt(lamports)),
      new Numberu32(BigInt(space)),
      undefined,
      TWITTER_ROOT_PARENT_REGISTRY_KEY,
      TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as owner of the parent for all user-facing registries
    ),
  ];

  instructions = instructions.concat(
    await createReverseTwitterRegistry(
      connection,
      twitterHandle,
      twitterHandleRegistryKey,
      verifiedPubkey,
      payerKey,
    ),
  );

  return instructions;
}

// Overwrite the data that is written in the user facing registry
// Signed by the verified pubkey
export async function changeTwitterRegistryData(
  twitterHandle: string,
  verifiedPubkey: PublicKey,
  offset: number, // The offset at which to write the input data into the NameRegistryData
  input_data: Buffer,
): Promise<TransactionInstruction[]> {
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const instructions = [
    updateInstruction(
      NAME_PROGRAM_ID,
      twitterHandleRegistryKey,
      new Numberu32(BigInt(offset)),
      input_data,
      verifiedPubkey,
    ),
  ];

  return instructions;
}

// Change the verified pubkey for a given twitter handle
// Signed by the Authority, the verified pubkey and the payer
export async function changeVerifiedPubkey(
  connection: Connection,
  twitterHandle: string,
  currentVerifiedPubkey: PublicKey,
  newVerifiedPubkey: PublicKey,
  payerKey: PublicKey,
): Promise<TransactionInstruction[]> {
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  // Transfer the user-facing registry ownership
  let instructions = [
    transferInstruction(
      NAME_PROGRAM_ID,
      twitterHandleRegistryKey,
      newVerifiedPubkey,
      currentVerifiedPubkey,
      undefined,
    ),
  ];

  instructions.push(
    await deleteNameRegistry(
      connection,
      currentVerifiedPubkey.toString(),
      payerKey,
      TWITTER_VERIFICATION_AUTHORITY,
      TWITTER_ROOT_PARENT_REGISTRY_KEY,
    ),
  );

  // Create the new reverse registry
  instructions = instructions.concat(
    await createReverseTwitterRegistry(
      connection,
      twitterHandle,
      twitterHandleRegistryKey,
      newVerifiedPubkey,
      payerKey,
    ),
  );

  return instructions;
}

// Delete the verified registry for a given twitter handle
// Signed by the verified pubkey
export async function deleteTwitterRegistry(
  twitterHandle: string,
  verifiedPubkey: PublicKey,
): Promise<TransactionInstruction[]> {
  const hashedTwitterHandle = getHashedNameSync(twitterHandle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const hashedVerifiedPubkey = getHashedNameSync(verifiedPubkey.toString());
  const reverseRegistryKey = getNameAccountKeySync(
    hashedVerifiedPubkey,
    TWITTER_VERIFICATION_AUTHORITY,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  const instructions = [
    // Delete the user facing registry
    deleteInstruction(
      NAME_PROGRAM_ID,
      twitterHandleRegistryKey,
      verifiedPubkey,
      verifiedPubkey,
    ),
    // Delete the reverse registry
    deleteInstruction(
      NAME_PROGRAM_ID,
      reverseRegistryKey,
      verifiedPubkey,
      verifiedPubkey,
    ),
  ];

  return instructions;
}

//////////////////////////////////////////
// Getter Functions

// Returns the key of the user-facing registry
export async function getTwitterRegistryKey(
  twitter_handle: string,
): Promise<PublicKey> {
  const hashedTwitterHandle = getHashedNameSync(twitter_handle);
  return getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );
}

export async function getTwitterRegistry(
  connection: Connection,
  twitter_handle: string,
): Promise<NameRegistryState> {
  const hashedTwitterHandle = getHashedNameSync(twitter_handle);
  const twitterHandleRegistryKey = getNameAccountKeySync(
    hashedTwitterHandle,
    undefined,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );
  const { registry } = await NameRegistryState.retrieve(
    connection,
    twitterHandleRegistryKey,
  );
  return registry;
}

export async function getHandleAndRegistryKey(
  connection: Connection,
  verifiedPubkey: PublicKey,
): Promise<[string, PublicKey]> {
  const hashedVerifiedPubkey = getHashedNameSync(verifiedPubkey.toString());
  const reverseRegistryKey = getNameAccountKeySync(
    hashedVerifiedPubkey,
    TWITTER_VERIFICATION_AUTHORITY,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );

  let reverseRegistryState = await ReverseTwitterRegistryState.retrieve(
    connection,
    reverseRegistryKey,
  );
  return [
    reverseRegistryState.twitterHandle,
    new PublicKey(reverseRegistryState.twitterRegistryKey),
  ];
}

// Uses the RPC node filtering feature, execution speed may vary
export async function getTwitterHandleandRegistryKeyViaFilters(
  connection: Connection,
  verifiedPubkey: PublicKey,
): Promise<[string, PublicKey]> {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: TWITTER_ROOT_PARENT_REGISTRY_KEY.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 32,
        bytes: verifiedPubkey.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 64,
        bytes: TWITTER_VERIFICATION_AUTHORITY.toBase58(),
      },
    },
  ];
  const filteredAccounts = await connection.getProgramAccounts(
    NAME_PROGRAM_ID,
    { filters },
  );

  for (const f of filteredAccounts) {
    if (f.account.data.length > NameRegistryState.HEADER_LEN + 32) {
      let data = f.account.data.slice(NameRegistryState.HEADER_LEN);
      let state: ReverseTwitterRegistryState = deserializeUnchecked(
        ReverseTwitterRegistryState.schema,
        ReverseTwitterRegistryState,
        data,
      );
      return [state.twitterHandle, new PublicKey(state.twitterRegistryKey)];
    }
  }
  throw new SNSError(ErrorType.AccountDoesNotExist);
}

// Uses the RPC node filtering feature, execution speed may vary
// Does not give you the handle, but is an alternative to getHandlesAndKeysFromVerifiedPubkey + getTwitterRegistry to get the data
export async function getTwitterRegistryData(
  connection: Connection,
  verifiedPubkey: PublicKey,
): Promise<Buffer> {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: TWITTER_ROOT_PARENT_REGISTRY_KEY.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 32,
        bytes: verifiedPubkey.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 64,
        bytes: new PublicKey(Buffer.alloc(32, 0)).toBase58(),
      },
    },
  ];

  const filteredAccounts = await connection.getProgramAccounts(
    NAME_PROGRAM_ID,
    { filters },
  );

  if (filteredAccounts.length > 1) {
    throw new SNSError(ErrorType.MultipleRegistries);
  }

  return filteredAccounts[0].account.data.slice(NameRegistryState.HEADER_LEN);
}

//////////////////////////////////////////////
// Utils

export class ReverseTwitterRegistryState {
  twitterRegistryKey: Uint8Array;
  twitterHandle: string;

  static schema: Schema = new Map([
    [
      ReverseTwitterRegistryState,
      {
        kind: "struct",
        fields: [
          ["twitterRegistryKey", [32]],
          ["twitterHandle", "string"],
        ],
      },
    ],
  ]);
  constructor(obj: { twitterRegistryKey: Uint8Array; twitterHandle: string }) {
    this.twitterRegistryKey = obj.twitterRegistryKey;
    this.twitterHandle = obj.twitterHandle;
  }

  public static async retrieve(
    connection: Connection,
    reverseTwitterAccountKey: PublicKey,
  ): Promise<ReverseTwitterRegistryState> {
    let reverseTwitterAccount = await connection.getAccountInfo(
      reverseTwitterAccountKey,
      "processed",
    );
    if (!reverseTwitterAccount) {
      throw new SNSError(ErrorType.InvalidReverseTwitter);
    }

    let res: ReverseTwitterRegistryState = deserializeUnchecked(
      this.schema,
      ReverseTwitterRegistryState,
      reverseTwitterAccount.data.slice(NameRegistryState.HEADER_LEN),
    );

    return res;
  }
}

export async function createReverseTwitterRegistry(
  connection: Connection,
  twitterHandle: string,
  twitterRegistryKey: PublicKey,
  verifiedPubkey: PublicKey,
  payerKey: PublicKey,
): Promise<TransactionInstruction[]> {
  // Create the reverse lookup registry
  const hashedVerifiedPubkey = getHashedNameSync(verifiedPubkey.toString());
  const reverseRegistryKey = getNameAccountKeySync(
    hashedVerifiedPubkey,
    TWITTER_VERIFICATION_AUTHORITY,
    TWITTER_ROOT_PARENT_REGISTRY_KEY,
  );
  let reverseTwitterRegistryStateBuff = serialize(
    ReverseTwitterRegistryState.schema,
    new ReverseTwitterRegistryState({
      twitterRegistryKey: twitterRegistryKey.toBytes(),
      twitterHandle,
    }),
  );
  return [
    createInstruction(
      NAME_PROGRAM_ID,
      SystemProgram.programId,
      reverseRegistryKey,
      verifiedPubkey,
      payerKey,
      hashedVerifiedPubkey,
      new Numberu64(
        BigInt(
          await connection.getMinimumBalanceForRentExemption(
            reverseTwitterRegistryStateBuff.length +
              NameRegistryState.HEADER_LEN,
          ),
        ),
      ),
      new Numberu32(BigInt(reverseTwitterRegistryStateBuff.length)),
      TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as class for all reverse-lookup registries
      TWITTER_ROOT_PARENT_REGISTRY_KEY, // Reverse registries are also children of the root
      TWITTER_VERIFICATION_AUTHORITY,
    ),
    updateInstruction(
      NAME_PROGRAM_ID,
      reverseRegistryKey,
      new Numberu32(BigInt(0)),
      Buffer.from(reverseTwitterRegistryStateBuff),
      TWITTER_VERIFICATION_AUTHORITY,
    ),
  ];
}
