package nft

import (
	"context"

	"github.com/Bonfida/sns-sdk/golang/errors"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gagliardetto/solana-go/rpc"
)

func RetrieveNftOwner(client rpc.Client, nameAccount solana.PublicKey) (*solana.PublicKey, error) {
	var mint, _, _ = solana.FindProgramAddress([][]byte{MINT_PREFIX, nameAccount.Bytes()}, NAME_TOKENIZER_ID)
	var mintInfo *token.Mint
	err := client.GetAccountDataInto(
		context.TODO(),
		mint,
		&mintInfo,
	)
	if err != nil {
		return nil, err
	}
	if mintInfo == nil || mintInfo.Supply == 0 {
		return nil, errors.ErrMintNotFound
	}
	res, err := client.GetProgramAccountsWithOpts(context.Background(), token.ProgramID, &rpc.GetProgramAccountsOpts{
		Filters: []rpc.RPCFilter{
			rpc.RPCFilter{
				Memcmp: &rpc.RPCFilterMemcmp{
					Offset: 0,
					Bytes:  mint.Bytes(),
				},
			},
			rpc.RPCFilter{
				Memcmp: &rpc.RPCFilterMemcmp{
					Offset: 64,
					Bytes:  []byte("2"),
				},
			},
			rpc.RPCFilter{
				DataSize: 165,
			},
		},
	})
	if err != nil {
		return nil, err
	}
	if len(res) == 0 {
		return nil, errors.ErrNftNotFound
	}
	pubkeyBytes, err := res[0].Account.Data.MarshalJSON()
	if err != nil {
		return nil, err
	}
	pubKey := solana.PublicKeyFromBytes(pubkeyBytes[32:64])
	return &pubKey, nil
}

func RetrieveNfts(client rpc.Client) (*solana.PublicKey, error) {
	res, err := client.GetProgramAccountsWithOpts(context.Background(), NAME_TOKENIZER_ID, &rpc.GetProgramAccountsOpts{
		Filters: []rpc.RPCFilter{
			rpc.RPCFilter{
				Memcmp: &rpc.RPCFilterMemcmp{
					Offset: 0,
					Bytes:  []byte("3"),
				},
			},
		},
	})
	if err != nil {
		return nil, err
	}
	const Offset = 1 + 1 + 32 + 32
	if len(res) == 0 {
		return nil, errors.ErrNftNotFound
	}
	pubkeyBytes, err := res[0].Account.Data.MarshalJSON()
	if err != nil {
		return nil, err
	}
	pubKey := solana.PublicKeyFromBytes(pubkeyBytes[Offset : Offset+32])
	return &pubKey, nil
}

func GetFilter(owner string) *[]rpc.RPCFilter {
	filters := []rpc.RPCFilter{
		rpc.RPCFilter{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 32,
				Bytes:  []byte(owner),
			},
		},
		rpc.RPCFilter{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 64,
				Bytes:  []byte("2"),
			},
		},
	}
	return &filters
}

func Closure(client rpc.Client, acc token.Account) (*NftRecord, error) {
	record, err := GetRecordFromMint(client, acc.Mint)
	if err != nil {
		return nil, err
	}
	if len(record) == 1 {
		nftRecord, err := DeserializeNftRecord(record[0].Account.Owner.Bytes())
		if err != nil {
			return nil, err
		}
		return nftRecord, nil
	}
	return nil, errors.ErrNftNotFound
}
