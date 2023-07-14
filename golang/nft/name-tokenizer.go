package nft

import (
	"context"

	"github.com/davecgh/go-spew/spew"
	bin "github.com/gagliardetto/binary"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

var NAME_TOKENIZER_ID, _ = solana.PublicKeyFromBase58("nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk")

var MINT_PREFIX = []byte("tokenized_name")

type Tag uint8

const (
	Uninitialized  Tag = 0
	CentralState   Tag = 1
	ActiveRecord   Tag = 2
	InactiveRecord Tag = 3
)

type NftRecord struct {
	Tag          Tag
	Nonce        uint32
	NameAccounnt *solana.PublicKey
	Owner        *solana.PublicKey
	NftMint      *solana.PublicKey
}

func NewNftRecord(tag uint8, nonce uint32, nameAccount []byte, owner []byte, nftMint []byte) *NftRecord {
	nameAccountPubKey := solana.PublicKeyFromBytes(nameAccount)
	ownerPubKey := solana.PublicKeyFromBytes(owner)
	nftMintPubKey := solana.PublicKeyFromBytes(nftMint)
	return &NftRecord{
		Tag:          Tag(tag),
		Nonce:        nonce,
		NameAccounnt: &nameAccountPubKey,
		Owner:        &ownerPubKey,
		NftMint:      &nftMintPubKey,
	}
}

func RetrieveNftRecord(client rpc.Client, key solana.PublicKey) (*NftRecord, error) {
	accountInfo, err := client.GetAccountInfo(context.Background(), key)
	if err != nil {
		return nil, err
	}
	nftRecord, err := DeserializeNftRecord(accountInfo.Bytes())
	if err != nil {
		return nil, err
	}
	return nftRecord, nil
}

func DeserializeNftRecord(data []byte) (*NftRecord, error) {
	var nftRecord NftRecord
	err := bin.NewBinDecoder(data).Decode(&nftRecord)
	if err != nil {
		return nil, err
	}
	spew.Dump(nftRecord)
	return &nftRecord, nil
}

func FindNftRecordKey(nameAccount solana.PublicKey, programId solana.PublicKey) (solana.PublicKey, uint8) {
	pubkey, bump, _ := solana.FindProgramAddress(
		[][]byte{
			[]byte("nft_record"),
			nameAccount.Bytes(),
		},
		programId,
	)
	return pubkey, bump
}

func GetRecordFromMint(client rpc.Client, mint solana.PublicKey) (rpc.GetProgramAccountsResult, error) {
	filters := []rpc.RPCFilter{
		rpc.RPCFilter{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 0,
				Bytes:  []byte("3"),
			},
		},
		rpc.RPCFilter{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 1 + 1 + 32 + 32,
				Bytes:  mint.Bytes(),
			},
		},
	}
	res, err := client.GetProgramAccountsWithOpts(context.Background(), NAME_TOKENIZER_ID, &rpc.GetProgramAccountsOpts{
		Filters: filters,
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}
