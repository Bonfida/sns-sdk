import { Schema, deserialize, deserializeUnchecked, serialize } from "borsh";
import { Record } from "record";
import { ErrorType, SNSError } from "./error";
import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "./state";
import * as tweetnacl from "tweetnacl";
import { hashMessage } from "@ethersproject/hash";
import { recoverAddress } from "@ethersproject/transactions";
import { getAddress } from "@ethersproject/address";
import { encode as encodePunycode } from "punycode";
import { check } from "./utils";
import { decode, encode } from "bech32-buffer";
import ipaddr from "ipaddr.js";

// Derivation TODO

export enum GuardianSig {
  None = 0,
  Solana = 1,
  Ethereum = 2,
  Injective = 3,
}

export enum UserSig {
  None = 0,
  Solana = 1,
}

const Guardians = new Map<Record, PublicKey>([]);

const UTF8_ENCODED = new Set<Record>([
  Record.IPFS,
  Record.ARWV,
  Record.LTC,
  Record.DOGE,
  Record.Email,
  Record.Url,
  Record.Discord,
  Record.Github,
  Record.Reddit,
  Record.Twitter,
  Record.Telegram,
  Record.Pic,
  Record.SHDW,
  Record.POINT,
  Record.Backpack,
  Record.TXT,
  Record.CNAME,
]);

export const getSignatureByteLength = (
  signatureType: GuardianSig | UserSig
): number => {
  switch (signatureType) {
    case GuardianSig.None:
      return 0;
    case GuardianSig.Solana:
      return 64;
    case GuardianSig.Ethereum:
      return 65;
    case GuardianSig.Injective:
      return 65;
    case UserSig.None:
      return 0;
    case UserSig.Solana:
      return 64;
    default:
      throw new SNSError(
        ErrorType.UnsupportedSignature,
        `Unsupported signature type: ${signatureType}`
      );
  }
};

export const getGuardianPublickey = (record: Record, owner: Buffer): Buffer => {
  switch (record) {
    case Record.ETH:
      return owner;
    case Record.Injective:
      return owner;
  }

  throw new SNSError(ErrorType.RecordDoestNotSupportGuardianSig);
};

export const verifySolanaSignature = (
  content: Buffer,
  signature: Buffer,
  publicKey: Buffer
): boolean => {
  return tweetnacl.sign.detached.verify(content, signature, publicKey);
};

export const verifyEthereumSignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  const digest = hashMessage(message);
  const recoveredAddress = recoverAddress(digest, signature);
  return recoveredAddress === getAddress(publicKey);
};

export const verifyInjectiveSignature = (): boolean => {
  throw new Error("TODO");
};

export const verifyGuardianSignature = (
  content: Buffer,
  signature: Buffer,
  publicKey: Buffer,
  record: Record
): boolean => {
  switch (record) {
    case Record.ETH:
    // Verify Guardian ETH sig
    case Record.Injective:
    //
  }

  throw new Error("TODO");
};

// Always a Solana signature
export const verifyUserSignature = () => {};

export class RecordV2Header {
  userSignature: UserSig;
  guardianSignature: GuardianSig;
  contentLength: number;

  static LEN: number = 2 + 2 + 4;

  static schema: Schema = new Map([
    [
      RecordV2Header,
      {
        kind: "struct",
        fields: [
          ["userSignature", "u16"],
          ["guardianSignature", "u16"],
          ["contentLength", "u32"],
        ],
      },
    ],
  ]);

  constructor(obj: {
    userSignature: number;
    guardianSignature: number;
    contentLength: number;
  }) {
    this.userSignature = obj.userSignature;
    this.guardianSignature = obj.guardianSignature;
    this.contentLength = obj.contentLength;
  }

  static deserialize(buffer: Buffer): RecordV2Header {
    return deserialize(this.schema, RecordV2Header, buffer);
  }
}

export interface RetrieveConfig {
  skipUserSig?: boolean;
  skipGuardianSig?: boolean;
  deserialize?: boolean;
}

export class RecordV2 {
  header: RecordV2Header;
  buffer: Buffer;

  static schema: Schema = new Map([
    [
      RecordV2,
      {
        kind: "struct",
        fields: [
          ["header", RecordV2Header],
          ["buffer", ["u8"]],
        ],
      },
    ],
    RecordV2Header.schema.get(RecordV2Header),
  ]);

  constructor(obj: { header: RecordV2Header; buffer: Buffer }) {
    this.header = obj.header;
    this.buffer = obj.buffer;
  }

  static deserializeUnchecked(buffer: Buffer): RecordV2 {
    return deserializeUnchecked(this.schema, RecordV2, buffer);
  }

  serialize(): Uint8Array {
    return serialize(RecordV2.schema, this);
  }

  static async retrieve(
    connection: Connection,
    recordKey: PublicKey,
    record: Record,
    config?: RetrieveConfig
  ) {
    const { registry } = await NameRegistryState.retrieve(
      connection,
      recordKey
    );

    if (!registry.data) {
      throw new SNSError(ErrorType.InvalidRecordData);
    }

    const { header, buffer } = this.deserializeUnchecked(registry.data);

    const offset =
      getSignatureByteLength(header.guardianSignature) +
      getSignatureByteLength(header.userSignature);
    const content = buffer.slice(offset, offset + header.contentLength);
    const msgToSign = Buffer.concat([recordKey.toBuffer(), content]);

    if (!config?.skipGuardianSig) {
      const sigLen = getSignatureByteLength(header.guardianSignature);
      const offset = getSignatureByteLength(header.userSignature);
      const signature = buffer.slice(offset, offset + sigLen);
      const guardianPublickey = Buffer.alloc(0); // TODO change
      verifyGuardianSignature(msgToSign, signature, guardianPublickey, record);
    }

    if (!config?.skipUserSig) {
      const sigLen = getSignatureByteLength(header.userSignature);
      const signature = registry.data.slice(0, sigLen);
      verifySolanaSignature(msgToSign, signature, registry.owner.toBuffer());
    }

    // Deserialize content buffer to human readable string
    if (config?.deserialize) {
      return deserializeRecordV2(content, record);
    }

    return;
  }
}

export const deserializeRecordV2 = (content: Buffer, record: Record) => {
  const utf8Encoded = UTF8_ENCODED.has(record);

  if (utf8Encoded) {
    return content.toString("utf-8");
  } else if (record === Record.SOL) {
    return new PublicKey(content).toBase58();
  } else if (record === Record.ETH || record === Record.BSC) {
    return "0x" + content.toString("hex");
  } else if (record === Record.Injective) {
    return encode("inj", content, "bech32");
  } else if (record === Record.A || record === Record.AAAA) {
    return ipaddr.fromByteArray([...content]).toString();
  }
};

const EMPTY_BUFFER = Buffer.alloc(0);

export const serializeRecordV2 = (
  content: string,
  record: Record,
  userSignature = EMPTY_BUFFER,
  guardianSignature = EMPTY_BUFFER
): Uint8Array => {
  let buffer: Buffer;

  const utf8Encoded = UTF8_ENCODED.has(record);
  if (utf8Encoded) {
    if (record === Record.CNAME || record === Record.TXT) {
      content = encodePunycode(content);
    }
    buffer = Buffer.from(content, "utf-8");
  } else if (record === Record.SOL) {
    buffer = new PublicKey(content).toBuffer();
  } else if (record === Record.ETH || record === Record.BSC) {
    check(content.slice(0, 2) === "0x", ErrorType.InvalidEvmAddress);
    buffer = Buffer.from(content.slice(2), "hex");
  } else if (record === Record.Injective) {
    const decoded = decode(content);
    check(decoded.prefix === "inj", ErrorType.InvalidInjectiveAddress);
    check(decoded.data.length === 20, ErrorType.InvalidInjectiveAddress);
    buffer = Buffer.from(decoded.data);
  } else if (record === Record.A) {
    const array = ipaddr.parse(content).toByteArray();
    check(array.length === 4, ErrorType.InvalidARecord);
    buffer = Buffer.from(array);
  } else if (record === Record.AAAA) {
    const array = ipaddr.parse(content).toByteArray();
    check(array.length === 16, ErrorType.InvalidAAAARecord);
    buffer = Buffer.from(array);
  } else {
    throw new SNSError(ErrorType.InvalidARecord);
  }

  const header = new RecordV2Header({
    userSignature: userSignature.length,
    guardianSignature: guardianSignature.length,
    contentLength: buffer.length,
  });
  const recordV2 = new RecordV2({
    header,
    buffer: Buffer.concat([userSignature, guardianSignature, buffer]),
  });

  return recordV2.serialize();
};
