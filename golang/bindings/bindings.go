package bindings

import (
	"context"

	"github.com/Bonfida/sns-sdk/golang/constants"
	"github.com/Bonfida/sns-sdk/golang/instructions"
	"github.com/Bonfida/sns-sdk/golang/state"
	"github.com/Bonfida/sns-sdk/golang/types"
	"github.com/Bonfida/sns-sdk/golang/utils"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

type CreateNameRegistryOpts struct {
	lamports   uint64
	nameClass  *solana.PublicKey
	parentName *solana.PublicKey
}

func CreateNameRegistry(
	client rpc.Client,
	name string,
	space uint64,
	payerKey *solana.PublicKey,
	nameOwner *solana.PublicKey,
	opts CreateNameRegistryOpts,
) solana.Instruction {
	hashedName := utils.GetHashedNameSync(name)
	nameAccountKey := utils.GetNameAccountKeySync(hashedName, types.GetNameAccountKeySyncOpts{
		NameClass:  *opts.nameClass,
		NameParent: *opts.parentName,
	})

	var balance uint64
	if opts.lamports == 0 {
		balance, _ = client.GetMinimumBalanceForRentExemption(context.Background(), space, rpc.CommitmentConfirmed)
	} else {
		balance = opts.lamports
	}
	var nameParentOwner *solana.PublicKey
	if opts.parentName != nil {
		parentAccount, _, _ := state.RetrieveNameRegistry(client, *opts.parentName)
		nameParentOwner = parentAccount.Owner
	}

	ix := instructions.CreateInstruction(
		&constants.NAME_PROGRAM_ID,
		&solana.SystemProgramID,
		&nameAccountKey,
		nameOwner,
		payerKey,
		hashedName,
		balance,
		space,
		instructions.CreateInstructionOpts{
			NameClassKey:       opts.nameClass,
			NameParentKey:      opts.parentName,
			NameParentOwnerKey: nameParentOwner,
		},
	)
	return ix
}

type UpdateNameRegistryDataOpts struct {
	NameClass  *solana.PublicKey
	NameParent *solana.PublicKey
}

func UpdateNameRegistryData(
	client rpc.Client,
	name string,
	offset uint64,
	data []byte,
	opts UpdateNameRegistryDataOpts,
) solana.Instruction {
	hashedName := utils.GetHashedNameSync(name)
	nameAccountKey := utils.GetNameAccountKeySync(hashedName, types.GetNameAccountKeySyncOpts{
		NameClass:  *opts.NameClass,
		NameParent: *opts.NameParent,
	})
	var signer *solana.PublicKey
	if opts.NameClass != nil {
		signer = opts.NameClass
	} else {
		registry, _, _ := state.RetrieveNameRegistry(client, nameAccountKey)
		signer = registry.Owner
	}

	ix := instructions.UpdateInstruction(
		&constants.NAME_PROGRAM_ID,
		&nameAccountKey,
		offset,
		data,
		signer,
	)
	return ix
}
