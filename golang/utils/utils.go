package utils

import (
	"bytes"
	"crypto/sha256"
	"encoding/binary"

	"github.com/Bonfida/sns-sdk/golang/constants"
	"github.com/Bonfida/sns-sdk/golang/errors"
	"github.com/Bonfida/sns-sdk/golang/state"
	"github.com/Bonfida/sns-sdk/golang/types"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

func GetHashedNameSync(name string) []byte {
	input := constants.HASH_PREFIX + name
	str := sha256.Sum256([]byte(input))
	return str[:]
}

func GetNameAccountKeySync(args types.GetNameAccountKeySyncOpts) solana.PublicKey {
	seeds := [][]byte{
		args.HashedName,
	}
	if args.NameClass.Bytes() != nil {
		seeds = append(seeds, args.NameClass.Bytes())
	} else {
		seeds = append(seeds, make([]byte, 32))
	}
	if args.NameParent.Bytes() != nil {
		seeds = append(seeds, args.NameParent.Bytes())
	} else {
		seeds = append(seeds, make([]byte, 32))
	}
	nameAccountKey, _, _ := solana.FindProgramAddress(seeds, constants.NAME_PROGRAM_ID)
	return nameAccountKey
}

func ReverseLookup(client rpc.Client, nameAccount solana.PublicKey) (string, error) {
	hashedReverseLookup := GetHashedNameSync(nameAccount.String())
	reverseLookupAccount := GetNameAccountKeySync(types.GetNameAccountKeySyncOpts{
		HashedName: hashedReverseLookup,
		NameClass:  constants.REVERSE_LOOKUP_CLASS,
	})
	registry, _, err := state.RetrieveNameRegistry(client, reverseLookupAccount)
	if err != nil {
		return "", err
	}
	if registry.Data == nil {
		return "", errors.ErrNoAccountData
	}
	buf := bytes.NewReader(registry.Data[:4])
	var nameLength uint64
	err = binary.Read(buf, binary.LittleEndian, &nameLength)
	if err != nil {
		return "", err
	}
	return string(registry.Data[4 : 4+nameLength]), nil
}
