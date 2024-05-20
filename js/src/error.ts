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
  InvalidRoA = "InvalidRoA",
  InvalidPda = "InvalidPda",
  InvalidParrent = "InvalidParrent",
  NftRecordNotFound = "NftRecordNotFound",
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

export class SymbolNotFoundError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.SymbolNotFound, message);
  }
}

export class InvalidSubdomainError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidSubdomain, message);
  }
}

export class FavouriteDomainNotFoundError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.FavouriteDomainNotFound, message);
  }
}

export class MissingParentOwnerError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.MissingParentOwner, message);
  }
}

export class U32OverflowError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.U32Overflow, message);
  }
}

export class InvalidBufferLengthError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidBufferLength, message);
  }
}

export class U64OverflowError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.U64Overflow, message);
  }
}

export class NoRecordDataError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.NoRecordData, message);
  }
}

export class InvalidRecordDataError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidRecordData, message);
  }
}

export class UnsupportedRecordError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.UnsupportedRecord, message);
  }
}

export class InvalidEvmAddressError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidEvmAddress, message);
  }
}

export class InvalidInjectiveAddressError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidInjectiveAddress, message);
  }
}

export class InvalidARecordError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidARecord, message);
  }
}

export class InvalidAAAARecordError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidAAAARecord, message);
  }
}

export class InvalidRecordInputError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidRecordInput, message);
  }
}

export class InvalidSignatureError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidSignature, message);
  }
}

export class AccountDoesNotExistError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.AccountDoesNotExist, message);
  }
}

export class MultipleRegistriesError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.MultipleRegistries, message);
  }
}
export class InvalidReverseTwitterError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidReverseTwitter, message);
  }
}

export class NoAccountDataError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.NoAccountData, message);
  }
}

export class InvalidInputError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidInput, message);
  }
}

export class InvalidDomainError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidDomain, message);
  }
}

export class InvalidCustomBgError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidCustomBg, message);
  }
}

export class UnsupportedSignatureError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.UnsupportedSignature, message);
  }
}

export class RecordDoestNotSupportGuardianSigError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.RecordDoestNotSupportGuardianSig, message);
  }
}

export class RecordIsNotSignedError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.RecordIsNotSigned, message);
  }
}

export class UnsupportedSignatureTypeError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.UnsupportedSignatureType, message);
  }
}

export class InvalidSolRecordV2Error extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidSolRecordV2, message);
  }
}

export class MissingVerifierError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.MissingVerifier, message);
  }
}

export class PythFeedNotFoundError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.PythFeedNotFound, message);
  }
}

export class InvalidRoAError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidRoA, message);
  }
}

export class InvalidPdaError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidPda, message);
  }
}

export class InvalidParrentError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.InvalidParrent, message);
  }
}

export class NftRecordNotFoundError extends SNSError {
  constructor(message?: string) {
    super(ErrorType.NftRecordNotFound, message);
  }
}
