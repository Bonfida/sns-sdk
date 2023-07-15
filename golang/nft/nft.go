package nft

import (
	"context"

	"github.com/Bonfida/sns-sdk/golang/errors"
	"github.com/Bonfida/sns-sdk/golang/utils"
	"github.com/davecgh/go-spew/spew"
	bin "github.com/gagliardetto/binary"
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
	pubkeyBytes := res[0].Account.Data.GetBinary()
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

func RetrieveRecords(client rpc.Client, owner solana.PublicKey) ([]*NftRecord, error) {
	res, err := client.GetProgramAccountsWithOpts(context.Background(), token.ProgramID, &rpc.GetProgramAccountsOpts{
		Filters: append(*GetFilter(owner.String()), rpc.RPCFilter{
			DataSize: 165,
		}),
	})
	if err != nil {
		return nil, err
	}
	var records []*NftRecord
	for _, acc := range res {
		var tokenAcc *token.Account
		spew.Dump(acc)
		err := bin.NewBinDecoder(acc.Account.Data.GetBinary()).Decode(&tokenAcc)
		if err != nil {
			return nil, err
		}
		spew.Dump(tokenAcc)
		nftRecord, err := Closure(client, *tokenAcc)
		if err != nil {
			return nil, err
		}
		records = append(records, nftRecord)
	}
	return records, nil
}

type TokenizedDomain struct {
	Key     solana.PublicKey
	Mint    solana.PublicKey
	Reverse string
}

func GetTokenizedDomains(client rpc.Client, owner solana.PublicKey) ([]TokenizedDomain, error) {
	nftRecords, err := RetrieveRecords(client, owner)
	if err != nil {
		return nil, err
	}
	var nameAccounts []solana.PublicKey
	for _, record := range nftRecords {
		nameAccounts = append(nameAccounts, *record.NameAccounnt)
	}
	names, err := utils.ReverseLookupBatch(client, nameAccounts)
	if err != nil {
		return nil, err
	}
	var tokenizedDomains []TokenizedDomain
	for i, record := range names {
		tokenizedDomains = append(tokenizedDomains, TokenizedDomain{
			Key:     *nftRecords[i].NameAccounnt,
			Mint:    *nftRecords[i].NftMint,
			Reverse: record,
		})
	}
	return tokenizedDomains, nil
}
