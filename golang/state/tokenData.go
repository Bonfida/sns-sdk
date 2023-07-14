package state

import (
	"bytes"

	"github.com/davecgh/go-spew/spew"
	bin "github.com/gagliardetto/binary"
)

type TokenData struct {
	Name     string
	Ticker   string
	Mint     []byte
	Decimals int
	Website  string `bin:"optional"`
	LogoUri  string `bin:"optional"`
}

type NewTokenDataOpts struct {
	Website string
	LogoUri string
}

func NewTokenData(name string, ticker string, mint []byte, decimals int, opts *NewTokenDataOpts) *TokenData {
	tokenData := &TokenData{
		Name:     name,
		Ticker:   ticker,
		Mint:     mint,
		Decimals: decimals,
	}
	if opts != nil && opts.LogoUri != "" {
		tokenData.LogoUri = opts.LogoUri
	}
	if opts != nil && opts.Website != "" {
		tokenData.Website = opts.Website
	}
	return tokenData
}

func (td *TokenData) Serialize() []byte {
	var buf bytes.Buffer
	err := bin.NewBorshEncoder(&buf).Encode(td)
	if err != nil {
		panic(err)
	}
	return buf.Bytes()
}

func DeserializeTokenData(data []byte) (*TokenData, error) {
	var td TokenData
	spew.Dump(data)
	err := bin.NewBorshDecoder(data).Decode(&td)
	if err != nil {
		return nil, err
	}
	return &td, nil
}
