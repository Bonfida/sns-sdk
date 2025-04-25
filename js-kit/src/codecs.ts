import { getTokenCodec } from "@solana-program/token";
import { getAddressCodec } from "@solana/addresses";
import {
  getBase58Codec,
  getBase64Codec,
  getUtf8Codec,
} from "@solana/codecs-strings";

export const addressCodec = getAddressCodec();

export const base58Codec = getBase58Codec();

export const base64Codec = getBase64Codec();

export const utf8Codec = getUtf8Codec();

export const tokenCodec = getTokenCodec();
