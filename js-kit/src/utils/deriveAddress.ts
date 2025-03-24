import {
  Address,
  ReadonlyUint8Array,
  getProgramDerivedAddress,
} from "@solana/kit";

import { addressCodec, utf8Codec } from "../codecs";
import { NAME_PROGRAM_ADDRESS } from "../constants/addresses";

const HASH_PREFIX = "SPL Name Service";

/**
 * Hashes a string using SHA-256.
 *
 * @param {string} str - The string to be hashed.
 * @returns {Promise<Uint8Array>} A promise that resolves to the hashed value as a Uint8Array.
 */
export const _generateHash = async (str: string): Promise<Uint8Array> => {
  const data = utf8Codec.encode(HASH_PREFIX + str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return new Uint8Array(hashBuffer);
};

/**
 * Derives an address from a hash.
 *
 * @param {Uint8Array} hash - The hash to derive the address from.
 * @param {Address} [parentAddress] - The optional parent address.
 * @param {Address} [classAddress] - The optional class address.
 * @returns {Promise<Address>} A promise that resolves to the derived address.
 */
export const _getAddressFromHash = async (
  hash: Uint8Array,
  parentAddress?: Address,
  classAddress?: Address
): Promise<Address> => {
  const seeds: ReadonlyUint8Array[] = [hash];
  seeds.push(
    classAddress ? addressCodec.encode(classAddress) : new Uint8Array(32)
  );
  seeds.push(
    parentAddress ? addressCodec.encode(parentAddress) : new Uint8Array(32)
  );

  const [address] = await getProgramDerivedAddress({
    programAddress: NAME_PROGRAM_ADDRESS,
    seeds,
  });

  return address;
};

/**
 * Derives an address from an input string, with optional parent address and
 * optional class address. These addresses form part of the seeds for Program
 * Derived Address (PDA) derivation.
 *
 * @param {string} str - The input string to derive the address from.
 * @param {Address} [parentAddress] - The optional parent address.
 * @param {Address} [classAddress] - The optional class address.
 * @returns {Promise<Address>} A promise that resolves to the derived address.
 */
export const deriveAddress = async (
  str: string,
  parentAddress?: Address,
  classAddress?: Address
) => {
  const hash = await _generateHash(str);
  const address = await _getAddressFromHash(hash, parentAddress, classAddress);

  return address;
};
