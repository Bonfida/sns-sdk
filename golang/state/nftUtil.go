package state

import (
	"context"

	"github.com/Bonfida/sns-sdk/golang/errors"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gagliardetto/solana-go/rpc"
)

var mint_prefix = []byte("tokenized_name")
var name_tokenizer_id, _ = solana.PublicKeyFromBase58("nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk")

func retrieveNftOwner(client rpc.Client, nameAccount solana.PublicKey) (*solana.PublicKey, error) {
	var mint, _, _ = solana.FindProgramAddress([][]byte{mint_prefix, nameAccount.Bytes()}, name_tokenizer_id)
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
	pubkeyBytes := res[0].Account.Data.GetBinary()
	pubKey := solana.PublicKeyFromBytes(pubkeyBytes[32:64])
	return &pubKey, nil
}
