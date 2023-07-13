package state

import (
	"bytes"

	bin "github.com/gagliardetto/binary"
)

type Mint struct {
	mint []byte
}

func NewMint(mint []byte) *Mint {
	return &Mint{
		mint: mint,
	}
}

func (m *Mint) Serialize() []byte {
	var buf bytes.Buffer
	err := bin.NewBorshEncoder(&buf).Encode(m)
	if err != nil {
		panic(err)
	}
	return buf.Bytes()
}

func DeserializeMint(data []byte) (*Mint, error) {
	var m Mint
	err := bin.NewBorshDecoder(data).Decode(&m)
	if err != nil {
		return nil, err
	}
	return &m, nil
}
