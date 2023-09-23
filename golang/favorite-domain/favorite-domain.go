package favoritedomain

import (
	"context"

	"github.com/Bonfida/sns-sdk/golang/utils"
	"github.com/davecgh/go-spew/spew"
	bin "github.com/gagliardetto/binary"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

var NAME_OFFERS_ID = solana.MustPublicKeyFromBase58("85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29")

type FavoriteDomain struct {
	tag         uint64
	nameAccount solana.PublicKey
}

func DeserializeFavoriteDomain(data []byte) (*FavoriteDomain, error) {
	var err error
	var domain FavoriteDomain
	err = bin.NewBinDecoder(data).Decode(&domain)
	if err != nil {
		return nil, err
	}
	spew.Dump(domain)
	return &domain, nil
}

func RetrieveFavoriteDomain(client rpc.Client, key solana.PublicKey) (*FavoriteDomain, error) {
	var domain FavoriteDomain
	accountInfo, err := client.GetAccountInfo(context.Background(), key)
	if err != nil {
		return nil, err
	}
	spew.Dump(accountInfo)
	err = bin.NewBinDecoder(accountInfo.GetBinary()).Decode(&domain)
	if err != nil {
		return nil, err
	}
	spew.Dump(domain)
	return &domain, nil
}

func GetFavoriteDomainKey(programId solana.PublicKey, owner solana.PublicKey) (solana.PublicKey, uint8) {
	seeds := [][]byte{
		[]byte("favourite_domain"),
		[]byte(owner.Bytes()),
	}
	favoriteDomainKey, bump, err := solana.FindProgramAddress(seeds, programId)
	if err != nil {
		panic(err)
	}
	return favoriteDomainKey, bump
}

func GetFavoriteDomain(
	client rpc.Client,
	owner solana.PublicKey,
) (*solana.PublicKey, string) {
	favoriteDomainKey, _ := GetFavoriteDomainKey(NAME_OFFERS_ID, owner)

	favoriteDomain, err := RetrieveFavoriteDomain(client, favoriteDomainKey)
	if err != nil {
		panic(err)
	}
	reverse, err := utils.ReverseLookup(client, favoriteDomain.nameAccount)
	if err != nil {
		panic(err)
	}
	return &favoriteDomain.nameAccount, reverse
}
