package instructions

import (
	"encoding/binary"

	"github.com/gagliardetto/solana-go"
)

type CreateInstructionOpts struct {
	NameClassKey       *solana.PublicKey
	NameParentKey      *solana.PublicKey
	NameParentOwnerKey *solana.PublicKey
}

func CreateInstruction(
	nameProgramId *solana.PublicKey,
	systemProgramId *solana.PublicKey,
	nameKey *solana.PublicKey,
	nameOwnerKey *solana.PublicKey,
	payerKey *solana.PublicKey,
	hashedName []uint8,
	lamports uint64,
	space uint64,
	opts CreateInstructionOpts,
) solana.Instruction {
	nameBuffer := make([]byte, 4)
	binary.LittleEndian.PutUint32(nameBuffer, uint32(len(hashedName)))
	lamportBuffer := make([]byte, 8)
	binary.LittleEndian.PutUint64(lamportBuffer, lamports)
	spaceBuffer := make([]byte, 8)
	binary.LittleEndian.PutUint64(spaceBuffer, space)
	buffers := append([]byte{0}, nameBuffer...)
	buffers = append(buffers, hashedName...)
	buffers = append(buffers, lamportBuffer...)
	buffers = append(buffers, spaceBuffer...)

	keys := solana.AccountMetaSlice{
		solana.NewAccountMeta(*systemProgramId, false, false),
		solana.NewAccountMeta(*payerKey, true, true),
		solana.NewAccountMeta(*nameKey, true, false),
		solana.NewAccountMeta(*nameOwnerKey, false, false),
	}

	if opts.NameClassKey != nil {
		keys = append(keys, solana.NewAccountMeta(*opts.NameClassKey, false, true))
	} else {
		keys = append(keys, solana.NewAccountMeta(solana.PublicKey{}, false, false))
	}

	if opts.NameParentKey != nil {
		keys = append(keys, solana.NewAccountMeta(*opts.NameParentKey, false, false))
	} else {
		keys = append(keys, solana.NewAccountMeta(solana.PublicKey{}, false, false))
	}

	if opts.NameParentOwnerKey != nil {
		keys = append(keys, solana.NewAccountMeta(*opts.NameParentOwnerKey, false, true))
	}
	ix := solana.NewInstruction(*nameProgramId, keys, buffers)
	return ix
}

func UpdateInstruction(
	nameProgramId *solana.PublicKey,
	nameKey *solana.PublicKey,
	offset uint64,
	data []byte,
	nameUpdateSigner *solana.PublicKey,
) solana.Instruction {
	offsetBuffer := make([]byte, 8)
	binary.LittleEndian.PutUint64(offsetBuffer, offset)
	lengthBuffer := make([]byte, 8)
	binary.LittleEndian.PutUint64(lengthBuffer, uint64(len(data)))
	buffers := append([]byte{1}, offsetBuffer...)
	buffers = append(buffers, lengthBuffer...)
	buffers = append(buffers, data...)

	keys := solana.AccountMetaSlice{
		solana.NewAccountMeta(*nameKey, true, false),
		solana.NewAccountMeta(*nameUpdateSigner, false, true),
	}

	ix := solana.NewInstruction(*nameProgramId, keys, buffers)
	return ix
}
