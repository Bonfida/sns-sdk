package utils

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/binary"
	"strings"

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

func GetNameAccountKeySync(HashedName []byte, args types.GetNameAccountKeySyncOpts) solana.PublicKey {
	seeds := [][]byte{
		HashedName,
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
	reverseLookupAccount := GetNameAccountKeySync(hashedReverseLookup, types.GetNameAccountKeySyncOpts{
		NameClass: constants.REVERSE_LOOKUP_CLASS,
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

func ReverseLookupBatch(client rpc.Client, nameAccounts []solana.PublicKey) ([]string, error) {
	reverseLookupAccounts := make([]solana.PublicKey, len(nameAccounts))
	for i, nameAccount := range nameAccounts {
		hashedReverseLookup := GetHashedNameSync(nameAccount.String())
		reverseLookupAccounts[i] = GetNameAccountKeySync(hashedReverseLookup, types.GetNameAccountKeySyncOpts{
			NameClass: constants.REVERSE_LOOKUP_CLASS,
		})
	}
	names, err := state.RetrieveNameRegistryBatch(client, reverseLookupAccounts)
	if err != nil {
		return nil, err
	}
	var namesStr []string
	for _, name := range names {
		if name == nil || name.Data == nil {
			continue
		}
		buf := bytes.NewReader(name.Data[:4])
		var nameLength uint64
		err = binary.Read(buf, binary.LittleEndian, &nameLength)
		if err != nil {
			return nil, err
		}
		namesStr = append(namesStr, string(name.Data[4:4+nameLength]))
	}
	return namesStr, nil
}

func FindSubdomains(client rpc.Client, parentKey solana.PublicKey) ([]string, error) {
	filters := []rpc.RPCFilter{
		{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 0,
				Bytes:  solana.Base58(parentKey.String()),
			},
		},
		{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 64,
				Bytes:  solana.Base58(constants.REVERSE_LOOKUP_CLASS.String()),
			},
		},
	}
	reverse, err := client.GetProgramAccountsWithOpts(context.Background(), constants.NAME_PROGRAM_ID, &rpc.GetProgramAccountsOpts{Filters: filters})
	if err != nil {
		return nil, err
	}
	parent, err := ReverseLookup(client, parentKey)
	if err != nil {
		return nil, err
	}
	var subs []string
	for _, e := range reverse {
		subs = append(subs, strings.Join(strings.Split(string(e.Account.Data.GetBinary()[97]), "\\0"), ""))
	}
	var keys []solana.PublicKey
	for _, sub := range subs {
		pubkey, _, _, _ := GetDomainKeySync(sub+"."+parent, false)
		keys = append(keys, *pubkey)
	}
	subsAccounts, err := client.GetMultipleAccounts(context.Background(), keys...)
	if err != nil {
		return nil, err
	}
	var subdomains []string
	for i, e := range subs {
		if subsAccounts.Value[i] != nil {
			subdomains = append(subdomains, e)
		}
	}
	return subdomains, nil
}

func deriveSync(opts types.DeriveSyncOpts) (solana.PublicKey, []byte) {
	if opts.Parent == nil {
		opts.Parent = &constants.ROOT_DOMAIN_ACCOUNT
	}
	var hashed = GetHashedNameSync(opts.Name)
	var pubKey = GetNameAccountKeySync(hashed, types.GetNameAccountKeySyncOpts{
		NameParent: *opts.Parent,
	})
	return pubKey, hashed
}

func GetDomainKeySync(domain string, record bool) (*solana.PublicKey, []byte, bool, *solana.PublicKey) {
	domain = strings.TrimSuffix(domain, ".sol")
	splitted := strings.Split(domain, ".")
	if len(splitted) == 2 {
		var prefixBytes []byte
		if record {
			prefixBytes = []byte{1}
		} else {
			prefixBytes = []byte{0}
		}
		prefix := string(prefixBytes)
		sub := prefix + splitted[0]
		parentKey, _ := deriveSync(types.DeriveSyncOpts{Name: splitted[1]})
		result, hashed := deriveSync(types.DeriveSyncOpts{Name: sub, Parent: &parentKey})
		return &result, hashed, true, &parentKey
	} else if len(splitted) == 3 && record {
		parentKey, _ := deriveSync(types.DeriveSyncOpts{Name: splitted[2]})
		subKey, _ := deriveSync(types.DeriveSyncOpts{Name: "\\0" + splitted[1], Parent: &parentKey})
		recordPrefix := string([]byte{1})
		result, hashed := deriveSync(types.DeriveSyncOpts{Name: recordPrefix + splitted[0], Parent: &subKey})
		return &result, hashed, true, &parentKey
	} else {
		result, hashed := deriveSync(types.DeriveSyncOpts{Name: domain, Parent: &constants.ROOT_DOMAIN_ACCOUNT})
		return &result, hashed, false, nil
	}
}

func GetAllDomains(client rpc.Client, wallet solana.PublicKey) ([]*solana.PublicKey, error) {
	filters := []rpc.RPCFilter{
		{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 32,
				Bytes:  solana.Base58(wallet.String()),
			},
		},
		{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 0,
				Bytes:  solana.Base58(constants.ROOT_DOMAIN_ACCOUNT.String()),
			},
		},
	}
	accounts, err := client.GetProgramAccountsWithOpts(context.Background(), constants.NAME_PROGRAM_ID, &rpc.GetProgramAccountsOpts{Filters: filters})
	if err != nil {
		return nil, err
	}
	var domains []*solana.PublicKey
	for _, account := range accounts {
		domains = append(domains, &account.Pubkey)
	}
	return domains, nil
}

func GetAllRegisteredDomains(client rpc.Client) (*rpc.GetProgramAccountsResult, error) {
	filters := []rpc.RPCFilter{
		{
			Memcmp: &rpc.RPCFilterMemcmp{
				Offset: 0,
				Bytes:  solana.Base58(constants.ROOT_DOMAIN_ACCOUNT.String()),
			},
		},
	}
	var offset uint64 = 32
	var length uint64 = 32
	accounts, err := client.GetProgramAccountsWithOpts(context.Background(), constants.NAME_PROGRAM_ID, &rpc.GetProgramAccountsOpts{
		Filters: filters,
		DataSlice: &rpc.DataSlice{
			Offset: &offset,
			Length: &length,
		},
	})
	if err != nil {
		return nil, err
	}
	return &accounts, nil
}

func GetReverseKeySync(opts types.GetReverseKeySyncOpts) *solana.PublicKey {
	pubKey, _, _, parent := GetDomainKeySync(opts.Domain, false)
	hashedReverseLookup := GetHashedNameSync(pubKey.String())
	var reverseLookupAccount solana.PublicKey
	if opts.IsSub {
		reverseLookupAccount = GetNameAccountKeySync(hashedReverseLookup, types.GetNameAccountKeySyncOpts{
			NameClass:  constants.REVERSE_LOOKUP_CLASS,
			NameParent: *parent,
		})
		return &reverseLookupAccount
	} else {
		reverseLookupAccount = GetNameAccountKeySync(hashedReverseLookup, types.GetNameAccountKeySyncOpts{
			NameClass: constants.REVERSE_LOOKUP_CLASS,
		})
		return &reverseLookupAccount
	}
}
