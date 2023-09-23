package types

import "github.com/gagliardetto/solana-go"

type GetNameAccountKeySyncOpts struct {
	NameClass  solana.PublicKey
	NameParent solana.PublicKey
}

type DeriveSyncOpts struct {
	Name   string
	Parent *solana.PublicKey
}

type GetReverseKeySyncOpts struct {
	Domain string
	IsSub  bool
}

type GetRecordOpts struct {
	Deserialize bool
}
