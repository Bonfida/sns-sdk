package errors

import "errors"

var ErrMintNotFound = errors.New("mint not found")
var ErrNftNotFound = errors.New("nft not found")
var ErrTokenDataNotFound = errors.New("token data not found")
var ErrNoAccountData = errors.New("no account data")
var ErrNoRecordData = errors.New("no record data")
var ErrInvalidRecordData = errors.New("invalid record data")
var ErrUnsupportedSolRecord = errors.New("use `serializeSolRecord` for SOL record")
var ErrInvalidEvmAddress = errors.New("invalid EVM address")
var ErrInvalidInjectiveAddress = errors.New("invalid Injective address")
var ErrInvalidARecord = errors.New("invalid A record")
var ErrInvalidAAAARecord = errors.New("invalid AAAA record")
var ErrInvalidSolRecord = errors.New("invalid SOL record")
