package record

import (
	"encoding/hex"
	"net"

	"vendor/golang.org/x/net/idna"

	"github.com/Bonfida/sns-sdk/golang/errors"
	"github.com/Bonfida/sns-sdk/golang/resolve"
	"github.com/Bonfida/sns-sdk/golang/state"
	"github.com/Bonfida/sns-sdk/golang/types"
	"github.com/Bonfida/sns-sdk/golang/utils"
	"github.com/btcsuite/btcutil/bech32"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

func TrimNullPaddingIdx(data []byte) int {
	var index int
	for i := len(data) - 1; i >= 0; i = i - 1 {
		if data[i] != 0 {
			index = i
			break
		}
	}
	lastNonNull := 2*len(data) - 1 - index
	return lastNonNull
}

func GetRecordKeySync(domain string, record string) (*solana.PublicKey, error) {
	domainKey, _, _, _ := utils.GetDomainKeySync(record+"."+domain, true)
	return domainKey, nil
}

func GetRecord(client rpc.Client, domain string, record string) (*state.NameRegistryState, error) {
	pubkey, _ := GetRecordKeySync(domain, record)
	registry, _, _ := state.RetrieveNameRegistry(client, *pubkey)
	if registry.Data == nil {
		return nil, errors.ErrNoRecordData
	}
	recordSize := types.RECORD_V1_SIZE[record]
	registry.Data = registry.Data[:recordSize]
	return registry, nil
}

func GetDeserializedRecord(client rpc.Client, domain string, record string) (string, error) {
	pubkey, _ := GetRecordKeySync(domain, record)
	registry, _, _ := state.RetrieveNameRegistry(client, *pubkey)
	if registry.Data == nil {
		return "", errors.ErrNoRecordData
	}
	record, err := DeserializeRecord(registry, record, *pubkey)
	if err != nil {
		return "", err
	}
	return record, nil
}

func GetRecordsDeserialized(client rpc.Client, domain string, records []string) ([]string, error) {
	var pubkeys []solana.PublicKey
	for _, r := range records {
		key, _ := GetRecordKeySync(domain, r)
		pubkeys = append(pubkeys, *key)
	}
	registries, err := state.RetrieveNameRegistryBatch(client, pubkeys)
	if err != nil {
		return nil, err
	}
	var registryRecords []string
	for i, registry := range registries {
		if registry.Data == nil {
			registryRecords = append(registryRecords, "")
			continue
		}
		recordKey, _ := GetRecordKeySync(domain, records[i])
		record, err := DeserializeRecord(registry, records[i], *recordKey)
		if err != nil {
			return nil, err
		}
		registryRecords = append(registryRecords, record)
	}
	return registryRecords, nil
}

func GetRecords(client rpc.Client, domain string, records []string) ([]*state.NameRegistryState, error) {
	var pubkeys []solana.PublicKey
	for _, r := range records {
		key, _ := GetRecordKeySync(domain, r)
		pubkeys = append(pubkeys, *key)
	}
	registries, err := state.RetrieveNameRegistryBatch(client, pubkeys)
	if err != nil {
		return nil, err
	}
	return registries, nil
}

func GetIpfsRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.IPFS)
	return record
}

func GetArweaveRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.ARWV)
	return record
}

func GetEthRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.ETH)
	return record
}

func GetBtcRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.BTC)
	return record
}

func GetLtcRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.LTC)
	return record
}

func GetDogeRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.DOGE)
	return record
}

func GetEmailRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Email)
	return record
}

func GetUrlRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Url)
	return record
}

func GetDiscordRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Discord)
	return record
}

func GetGithubRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Github)
	return record
}

func GetRedditRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Reddit)
	return record
}

func GetTwitterRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Twitter)
	return record
}

func GetTelegramRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Telegram)
	return record
}

func GetPicRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Pic)
	return record
}

func GetShdwRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.SHDW)
	return record
}

func GetSolRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.SOL)
	return record
}

func GetPointRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.POINT)
	return record
}

func GetInjectiveRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Injective)
	return record
}

func GetBscRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.BSC)
	return record
}

func GetBackpackRecord(client rpc.Client, domain string) string {
	record, _ := GetDeserializedRecord(client, domain, types.Backpack)
	return record
}

func DeserializeRecord(registry *state.NameRegistryState, record string, recordKey solana.PublicKey) (string, error) {
	buffer := registry.Data
	if buffer == nil {
		return "", nil
	}
	size := types.RECORD_V1_SIZE[record]
	idx := TrimNullPaddingIdx(buffer)
	if size == 0 {
		return string(buffer[:idx]), nil
	}
	if size != 0 && idx != size {
		address := string(buffer[:idx])
		if record == types.Injective {
			decoded, _, _ := bech32.Decode(address)
			if decoded[:3] == "inj" && len(decoded) == 20 {
				return address, nil
			}
		} else if record == types.BSC || record == types.ETH {
			prefix := address[:2]
			hex := address[2:]
			if prefix == "0x" && len(hex) == 40 {
				return address, nil
			}
		} else if record == types.A || record == types.AAAA {
			if net.ParseIP(address) != nil {
				return address, nil
			}
		} else {
			return "", errors.ErrInvalidRecordData
		}
	}
	if record == types.SOL {
		expectedBuffer := append(buffer[:32], recordKey.Bytes()...)
		expected := []byte(hex.EncodeToString(expectedBuffer))
		valid := resolve.CheckSolRecord(expected, buffer[32:], *registry.Owner)
		if valid {
			return string(buffer[:32]), nil
		}
	} else if record == types.ETH || record == types.BSC {
		return "0x" + hex.EncodeToString(buffer[:size]), nil
	} else if record == types.Injective {
		return bech32.Encode("inj", buffer[:size])
	} else if record == types.A || record == types.AAAA {
		return net.IP(buffer).String(), nil
	}
	return "", errors.ErrInvalidRecordData
}

func SerializeRecord(str string, record string) ([]byte, error) {
	size := types.RECORD_V1_SIZE[record]
	if size == 0 {
		if record == types.CNAME || record == types.TXT {
			str, _ = idna.ToASCII(str)
		}
		return []byte(str), nil
	}

	if record == types.SOL {
		return nil, errors.ErrUnsupportedSolRecord
	} else if record == types.ETH || record == types.BSC {
		if str[:2] == "0x" {
			decoded, _ := hex.DecodeString(str[2:])
			return decoded, nil
		} else {
			return nil, errors.ErrInvalidEvmAddress
		}
	} else if record == types.Injective {
		decoded, _, _ := bech32.Decode(str)
		if decoded[:3] == "inj" && len(decoded) == 20 {
			return []byte(decoded), nil
		} else {
			return nil, errors.ErrInvalidInjectiveAddress
		}
	} else if record == types.A {
		ip := net.ParseIP(str)
		if len(ip) == 4 {
			return ip, nil
		} else {
			return nil, errors.ErrInvalidARecord
		}
	} else if record == types.AAAA {
		ip := net.ParseIP(str)
		if len(ip) == 16 {
			return ip, nil
		} else {
			return nil, errors.ErrInvalidAAAARecord
		}
	}
	return nil, errors.ErrInvalidRecordData
}

func SerializeSolRecord(content solana.PublicKey, recordKey solana.PublicKey, signer solana.PublicKey, signature []byte) ([]byte, error) {
	expected := append(content.Bytes(), recordKey.Bytes()...)
	encodedMessage := []byte(hex.EncodeToString(expected))
	valid := resolve.CheckSolRecord(encodedMessage, signature, signer)
	if !valid {
		return nil, errors.ErrInvalidSolRecord
	}
	return append(content[:], signature...), nil
}
