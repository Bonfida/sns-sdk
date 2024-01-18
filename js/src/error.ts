export enum ErrorType {
  SymbolNotFound = "SymbolNotFound",
  InvalidSubdomain = "InvalidSubdomain",
  FavouriteDomainNotFound = "FavouriteDomainNotFound",
  MissingParentOwner = "MissingParentOwner",
  U32Overflow = "U32Overflow",
  InvalidBufferLength = "InvalidBufferLength",
  U64Overflow = "U64Overflow",
  NoRecordData = "NoRecordData",
  InvalidRecordData = "InvalidRecordData",
  UnsupportedRecord = "UnsupportedRecord",
  InvalidEvmAddress = "InvalidEvmAddress",
  InvalidInjectiveAddress = "InvalidInjectiveAddress",
  InvalidARecord = "InvalidARecord",
  InvalidAAAARecord = "InvalidAAAARecord",
  InvalidRecordInput = "InvalidRecordInput",
  InvalidSignature = "InvalidSignature",
  AccountDoesNotExist = "AccountDoesNotExist",
  MultipleRegistries = "MultipleRegistries",
  InvalidReverseTwitter = "InvalidReverseTwitter",
  NoAccountData = "NoAccountData",
  InvalidInput = "InvalidInput",
  InvalidDomain = "InvalidDomain",
  InvalidCustomBg = "InvalidCustomBackground",
  UnsupportedSignature = "UnsupportedSignature",
  RecordDoestNotSupportGuardianSig = "RecordDoestNotSupportGuardianSig",
  RecordIsNotSigned = "RecordIsNotSigned",
  UnsupportedSignatureType = "UnsupportedSignatureType",
  InvalidSolRecordV2 = "InvalidSolRecordV2",
  MissingVerifier = "MissingVerifier",
  PythFeedNotFound = "PythFeedNotFound",
}

export class SNSError extends Error {
  type: ErrorType;

  constructor(type: ErrorType, message?: string) {
    super(message);
    this.name = "SNSError";
    this.type = type;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SNSError);
    }
  }
}
