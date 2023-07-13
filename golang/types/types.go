package types

import "github.com/gagliardetto/solana-go"

type GetNameAccountKeySyncOpts struct {
	HashedName []byte
	NameClass  solana.PublicKey
	NameParent solana.PublicKey
}
