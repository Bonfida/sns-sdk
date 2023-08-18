import { Schema, deserialize, deserializeUnchecked, serialize } from "borsh";
import { Record, RecordVersion } from "./types/record";
import { ErrorType, SNSError } from "./error";
import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "./state";
import * as tweetnacl from "tweetnacl";
import { hashMessage } from "@ethersproject/hash";
import { recoverAddress } from "@ethersproject/transactions";
import { getAddress } from "@ethersproject/address";
import { encode as encodePunycode, decode as decodePunnycode } from "punycode";
import { check, getDomainKeySync } from "./utils";
import { decode, encode } from "bech32-buffer";
import ipaddr from "ipaddr.js";

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

export interface Signature {
  signatureType: GuardianSig | UserSig;
  signature: Buffer;
}

export const NullUserSig: Signature = {
  signatureType: UserSig.None,
  signature: Buffer.alloc(0),
};

export const NullGuardianSig: Signature = {
  signatureType: GuardianSig.None,
  signature: Buffer.alloc(0),
};

/**
 * Map of record and guardian Public key
 */
export const Guardians = new Map<Record, Buffer>([
  // TODO: For dev purposes only, change this value later
  [
    Record.Backpack,
    new PublicKey("ExXjtfdQe8JacoqP9Z535WzQKjF4CzW1TTRKRgpxvya3").toBuffer(),
  ],
]);

/**
 * Set of records that are UTF-8 encoded strings
 */
export const UTF8_ENCODED = new Set<Record>([
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
  Record.BTC,
]);

/**
 * Set of records that are self signed i.e signed by the public key contained
 * in the record itself.
 */
export const SELF_SIGNED = new Set<Record>([
  Record.ETH,
  Record.Injective,
  Record.SOL,
]);

/**
 * This function returns the byte length given a signature type
 * @param signatureType The type of signature Guardian or User
 * @returns The byte length
 */
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

/**
 * This function returns the Guardian's public key for the record
 * @param record The record type
 * @param owner The owner of the domain
 * @returns The guardian's public key
 */
export const getGuardianPublickey = (record: Record): Buffer => {
  const pubkey = Guardians.get(record);
  if (!pubkey) {
    throw new SNSError(ErrorType.RecordDoestNotSupportGuardianSig);
  }
  return pubkey;
};

/**
 * This function verifies a Solana message's signature
 * @param message The message to verify as a Buffer
 * @param signature The signature as a Buffer
 * @param publicKey The expected signer public key as Buffer
 * @returns True if the signature is value and false otherwise
 */
export const verifySolanaSignature = (
  message: Buffer,
  signature: Buffer,
  publicKey: Buffer
): boolean => {
  return tweetnacl.sign.detached.verify(message, signature, publicKey);
};

/**
 * This function verifies an Ethereum message's signature
 * @param message The message to verify as a Buffer
 * @param signature The signature as a Buffer
 * @param publicKey The expected signer public key as Buffer
 * @returns True if the signature is value and false otherwise
 */
export const verifyEthereumSignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  const digest = hashMessage(message);
  const recoveredAddress = recoverAddress(digest, signature);
  return recoveredAddress === getAddress(publicKey);
};

/**
 * This function verifies an Injective message's signature
 * @param message The message to verify as a Buffer
 * @param signature The signature as a Buffer
 * @param publicKey The expected signer public key as Buffer
 * @returns True if the signature is value and false otherwise
 */
export const verifyInjectiveSignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  throw new Error("TODO");
};

/**
 * This function verifies a Guardian's signature
 * @param message The message to verify as a Buffer
 * @param signature  The signature as a Buffer
 * @param signer The signer of the record
 * @param publicKey
 * @returns True if the signature is value and false otherwise
 */
export const verifyGuardianSignature = (
  message: Buffer,
  signature: Buffer,
  signer: Buffer,
  guardianSig: GuardianSig
): boolean => {
  switch (guardianSig) {
    case GuardianSig.Ethereum:
      return verifyEthereumSignature(
        message.toString(),
        signature.toString(),
        signer.toString()
      );
    case GuardianSig.Injective:
      return verifyEthereumSignature(
        message.toString(),
        signature.toString(),
        signer.toString()
      );
    case GuardianSig.Solana:
      return verifySolanaSignature(message, signature, signer);
    case GuardianSig.None:
      throw new SNSError(ErrorType.RecordIsNotSigned);
    default:
      throw new SNSError(ErrorType.UnsupportedSignatureType);
  }
};

// Always a Solana signature
export const verifyUserSignature = (
  message: Buffer,
  signature: Buffer,
  signer: Buffer,
  userSig: UserSig
): boolean => {
  switch (userSig) {
    case UserSig.Solana:
      return verifySolanaSignature(message, signature, signer);
    case UserSig.None:
      throw new SNSError(ErrorType.RecordIsNotSigned);
    default:
      throw new SNSError(ErrorType.UnsupportedSignatureType);
  }
};

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

  serialize(): Uint8Array {
    return serialize(RecordV2Header.schema, this);
  }

  /**
   * This function deserializes a buffer into a `RecordV2Header`
   * @param buffer The buffer to deserialize into a `RecordV2Header`
   * @returns A RecordV2Header
   */
  static deserialize(buffer: Buffer): RecordV2Header {
    return deserialize(this.schema, RecordV2Header, buffer);
  }
}

/**
 *
 */
export interface RetrieveConfig {
  // Whether to skip the signature verification for the user
  skipUserSig?: boolean;
  // Whether to skip the signature verification for the guardian
  skipGuardianSig?: boolean;
}

export class RecordV2 {
  header: RecordV2Header;
  buffer: Buffer;

  constructor(obj: { header: RecordV2Header; buffer: Buffer }) {
    this.header = obj.header;
    this.buffer = obj.buffer;
  }

  getLength(): number {
    return RecordV2Header.LEN + this.buffer.length;
  }

  /**
   * This function deserializes a buffer into a `RecordV2`
   * @param buffer The buffer to deserialize into a `RecordV2`
   * @returns A RecordV2
   */
  static deserializeUnchecked(buffer: Buffer): RecordV2 {
    const header = deserializeUnchecked(
      RecordV2Header.schema,
      RecordV2Header,
      buffer
    );
    return new RecordV2({
      header,
      buffer: Buffer.from(buffer.slice(RecordV2Header.LEN)),
    });
  }

  /**
   * This function serializes a `RecordV2` into a Buffer
   * @returns A Buffer
   */
  serialize(): Buffer {
    const hd = this.header.serialize();
    return Buffer.concat([hd, this.buffer]);
  }

  /**
   * This function deserializes the content of a record using the SNS-IP 1 guideline
   * @param record The record type
   * @returns The deserialized content as a string
   */
  deserializeContent(record: Record): string {
    return deserializeRecordV2Content(this.getContent(), record);
  }

  /**
   * This function returns the content of the record as a Buffer
   * @returns The content of the record
   */
  getContent(): Buffer {
    const offset =
      getSignatureByteLength(this.header.guardianSignature) +
      getSignatureByteLength(this.header.userSignature);
    const content = Buffer.from(
      this.buffer.slice(offset, offset + this.header.contentLength)
    );
    return content;
  }

  /**
   * This function creates a `RecordV2` object
   * @param content The content to store in the record as a string
   * @param record The record type
   * @param userSignature The optional user signature of the record
   * @param guardianSignature The option guardian signature of the record
   * @returns The `RecordV2` created
   */
  static new(
    content: string,
    record: Record,
    userSignature = NullUserSig,
    guardianSignature = NullGuardianSig
  ): RecordV2 {
    const ser = serializeRecordV2Content(content, record);

    const buffer = Buffer.concat([
      userSignature.signature,
      guardianSignature.signature,
      ser,
    ]);
    const header = new RecordV2Header({
      userSignature: userSignature.signatureType,
      guardianSignature: guardianSignature.signatureType,
      contentLength: ser.length,
    });
    return new RecordV2({ header, buffer });
  }

  /**
   * This function verifies the signature of a message by a guardian
   * @param msg The message to verify
   * @param signer The expected signer of the message
   * @returns True if the signature is value and false otherwise
   */
  checkGuardianSignature(msg: Buffer, signer: Buffer): boolean {
    const sigLen = getSignatureByteLength(this.header.guardianSignature);
    const offset = getSignatureByteLength(this.header.userSignature);
    const signature = Buffer.from(this.buffer.slice(offset, offset + sigLen));
    return verifyGuardianSignature(
      msg,
      signature,
      signer,
      this.header.guardianSignature
    );
  }

  /**
   * This function verifies the signature of a message by a user
   * @param msg The message to verify
   * @param signer The expected signer of the message
   * @returns True if the signature is value and false otherwise
   */
  checkUserSignature(msg: Buffer, signer: Buffer): boolean {
    const sigLen = getSignatureByteLength(this.header.userSignature);
    const signature = Buffer.from(this.buffer.slice(0, sigLen));
    return verifyUserSignature(
      msg,
      signature,
      signer,
      this.header.userSignature
    );
  }

  /**
   * This function fetches the record of a domain. An optional
   * config can be specified to verify or not the signatures of the record
   * @param connection The Solana RPC connection object
   * @param record The type of record to fetch
   * @param domain The domain for which to fetch the record
   * @param config Optional config
   * @returns The `RecordV2` object stored in the record account
   */
  static async retrieve(
    connection: Connection,
    record: Record,
    domain: string,
    config?: RetrieveConfig
  ): Promise<RecordV2> {
    const recordKey = getRecordV2Key(domain, record);
    const { registry } = await NameRegistryState.retrieve(
      connection,
      recordKey
    );

    if (!registry.data) {
      throw new SNSError(ErrorType.InvalidRecordData);
    }

    const recordV2 = this.deserializeUnchecked(registry.data);
    const content = recordV2.getContent();
    const msgToSign = Buffer.concat([recordKey.toBuffer(), content]);

    if (!config?.skipGuardianSig) {
      const selfSigned = SELF_SIGNED.has(record);
      const signer = selfSigned
        ? Buffer.from(recordV2.getContent().slice(32))
        : getGuardianPublickey(record);
      recordV2.checkGuardianSignature(msgToSign, signer);
    }

    if (!config?.skipUserSig) {
      recordV2.checkUserSignature(msgToSign, registry.owner.toBuffer());
    }

    return recordV2;
  }

  static async retrieveBatch(
    connection: Connection,
    records: Record[],
    domain: string
  ): Promise<(RecordV2 | undefined)[]> {
    const pubkeys = records.map((record) => getRecordV2Key(domain, record));
    const registries = await NameRegistryState.retrieveBatch(
      connection,
      pubkeys
    );
    const result: (RecordV2 | undefined)[] = [];
    for (let r of registries) {
      try {
        if (!r?.data) {
          result.push(undefined);
          continue;
        }
        const des = RecordV2.deserializeUnchecked(r?.data);
        result.push(des);
      } catch {
        result.push(undefined);
      }
    }

    return result;
  }
}

/**
 * This function deserializes a buffer based on the type of record it corresponds to
 * If the record is not properly serialized according to SNS-IP 1 this function will throw an error
 * @param content The content to deserialize
 * @param record The type of record
 * @returns The deserialized content as a string
 */
export const deserializeRecordV2Content = (
  content: Buffer,
  record: Record
): string => {
  const utf8Encoded = UTF8_ENCODED.has(record);

  if (utf8Encoded) {
    const decoded = content.toString("utf-8");
    if (record === Record.CNAME || record === Record.TXT) {
      return decodePunnycode(decoded);
    }
    return decoded;
  } else if (record === Record.SOL) {
    return new PublicKey(content).toBase58();
  } else if (record === Record.ETH || record === Record.BSC) {
    return "0x" + content.toString("hex");
  } else if (record === Record.Injective) {
    return encode("inj", content, "bech32");
  } else if (record === Record.A || record === Record.AAAA) {
    return ipaddr.fromByteArray([...content]).toString();
  } else {
    throw new SNSError(ErrorType.InvalidARecord);
  }
};

/**
 * This function serializes a string based on the type of record it corresponds to
 * The serialization follows the SNS-IP 1 guideline
 * @param content The content to serialize
 * @param record The type of record
 * @returns The serialized content as a buffer
 */
export const serializeRecordV2Content = (
  content: string,
  record: Record
): Buffer => {
  const utf8Encoded = UTF8_ENCODED.has(record);
  if (utf8Encoded) {
    if (record === Record.CNAME || record === Record.TXT) {
      content = encodePunycode(content);
    }
    return Buffer.from(content, "utf-8");
  } else if (record === Record.SOL) {
    return new PublicKey(content).toBuffer();
  } else if (record === Record.ETH || record === Record.BSC) {
    check(content.slice(0, 2) === "0x", ErrorType.InvalidEvmAddress);
    return Buffer.from(content.slice(2), "hex");
  } else if (record === Record.Injective) {
    const decoded = decode(content);
    check(decoded.prefix === "inj", ErrorType.InvalidInjectiveAddress);
    check(decoded.data.length === 20, ErrorType.InvalidInjectiveAddress);
    return Buffer.from(decoded.data);
  } else if (record === Record.A) {
    const array = ipaddr.parse(content).toByteArray();
    check(array.length === 4, ErrorType.InvalidARecord);
    return Buffer.from(array);
  } else if (record === Record.AAAA) {
    const array = ipaddr.parse(content).toByteArray();
    check(array.length === 16, ErrorType.InvalidAAAARecord);
    return Buffer.from(array);
  } else {
    throw new SNSError(ErrorType.InvalidARecord);
  }
};

/**
 * This function returns the message to sign as Uint8Array for a domain
 * @param content The content that will be stored in the record
 * @param domain The domain which owns the reocrd
 * @param record The record type
 * @returns The Buffer to sign
 */
export const getMessageToSign = (
  content: string,
  domain: string,
  record: Record
): Uint8Array => {
  const buffer = serializeRecordV2Content(content, record);
  const recordKey = getRecordV2Key(domain, record);
  const hexStr = Buffer.concat([recordKey.toBuffer(), buffer]).toString("hex");
  return Uint8Array.from(Buffer.from(hexStr));
};

/**
 * This function derives a record v2 key
 * @param domain The .sol domain name
 * @param record The record to derive the key for
 * @returns Public key of the record
 */
export const getRecordV2Key = (domain: string, record: Record): PublicKey => {
  const { pubkey } = getDomainKeySync(record + "." + domain, RecordVersion.V2);
  return pubkey;
};
