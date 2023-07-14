package state

import (
	"context"

	"github.com/Bonfida/sns-sdk/golang/nft"
	"github.com/davecgh/go-spew/spew"
	bin "github.com/gagliardetto/binary"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

type NameRegistryState struct {
	ParentName *solana.PublicKey
	Owner      *solana.PublicKey
	Class      *solana.PublicKey
	Data       []uint8 `bin:"optional"`
}

func NewNameRegistry(parentName []uint8, owner []uint8, class []uint8) NameRegistryState {
	parentNamePubkey := solana.PublicKeyFromBytes(parentName)
	ownerPubkey := solana.PublicKeyFromBytes(owner)
	classPubkey := solana.PublicKeyFromBytes(class)
	return NameRegistryState{
		ParentName: &parentNamePubkey,
		Owner:      &ownerPubkey,
		Class:      &classPubkey,
	}
}

func RetrieveNameRegistry(client rpc.Client, nameAccountKey solana.PublicKey) (*NameRegistryState, *solana.PublicKey, error) {
	var registry NameRegistryState
	nameAccount, err := client.GetAccountInfo(context.Background(), nameAccountKey)
	if err != nil {
		return nil, nil, err
	}
	spew.Dump(nameAccount)
	err = bin.NewBinDecoder(nameAccount.GetBinary()).Decode(&registry)
	if err != nil {
		return nil, nil, err
	}
	spew.Dump(registry)
	registry.Data = nameAccount.Bytes()[96:]
	nftOwner, err := nft.RetrieveNftOwner(client, nameAccountKey)
	if err != nil {
		return nil, nil, err
	}
	return &registry, nftOwner, nil
}

func RetrieveNameRegistryBatch(client rpc.Client, nameAccountKeys []solana.PublicKey) ([]*NameRegistryState, error) {
	var registries []*NameRegistryState
	nameAccounts, err := client.GetMultipleAccountsWithOpts(context.Background(), nameAccountKeys, nil)
	if err != nil {
		return nil, err
	}
	for _, nameAccount := range nameAccounts.Value {
		spew.Dump(nameAccount)
		var registry NameRegistryState
		err = bin.NewBinDecoder(nameAccount.Data.GetBinary()).Decode(&registry)
		if err != nil {
			return nil, err
		}
		spew.Dump(registry)
		registry.Data = nameAccount.Data.GetBinary()[96:]
		registries = append(registries, &registry)
	}
	return registries, nil
}
