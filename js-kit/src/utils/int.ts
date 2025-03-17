export class Numberu32 {
  value: bigint;

  constructor(value: number | string | bigint) {
    this.value = BigInt(value);
  }

  /**
   * Convert to Uint8Array representation
   */
  toUint8Array(): Uint8Array {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, Number(this.value), true);
    return new Uint8Array(buffer);
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
   * Convert to Uint8Array representation
   */
  toUint8Array(): Uint8Array {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, this.value, true);
    return new Uint8Array(buffer);
  }

  toNumber(): number {
    return Number(this.value);
  }

  toString(): string {
    return String(this.value);
  }
}
