import { Buffer } from "buffer";
import { ErrorType, SNSError } from "./error";
export class Numberu32 {
  value: bigint;

  constructor(value: number | string | bigint) {
    this.value = BigInt(value);
  }

  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = Buffer.alloc(4);
    a.writeUInt32LE(Number(this.value));
    return a;
  }

  /**
   * Construct a Numberu32 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): Numberu32 {
    if (buffer.length !== 4) {
      throw new SNSError(
        ErrorType.InvalidBufferLength,
        `Invalid buffer length: ${buffer.length}`,
      );
    }

    const value = BigInt(buffer.readUInt32LE(0));
    return new Numberu32(value);
  }

  toNumber(): number {
    return Number(this.value);
  }

  toString(): string {
    return String(this.value);
  }
}

export class Numberu64 {
  value: bigint;

  constructor(value: number | string | bigint) {
    this.value = BigInt(value);
  }

  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = Buffer.alloc(8);
    a.writeBigUInt64LE(this.value);
    return a;
  }

  /**
   * Construct a Numberu64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): Numberu64 {
    if (buffer.length !== 8) {
      throw new SNSError(
        ErrorType.U64Overflow,
        `Invalid buffer length: ${buffer.length}`,
      );
    }

    const value = buffer.readBigUInt64LE(0);
    return new Numberu64(value);
  }

  toNumber(): number {
    return Number(this.value);
  }

  toString(): string {
    return String(this.value);
  }
}
