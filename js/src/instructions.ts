import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Numberu32, Numberu64 } from "./int";
import { Schema, serialize } from "borsh";

export function createInstruction(
  nameProgramId: PublicKey,
  systemProgramId: PublicKey,
  nameKey: PublicKey,
  nameOwnerKey: PublicKey,
  payerKey: PublicKey,
  hashed_name: Buffer,
  lamports: Numberu64,
  space: Numberu32,
  nameClassKey?: PublicKey,
  nameParent?: PublicKey,
  nameParentOwner?: PublicKey
): TransactionInstruction {
  const buffers = [
    Buffer.from(Int8Array.from([0])),
    //@ts-ignore
    new Numberu32(hashed_name.length).toBuffer(),
    hashed_name,
    lamports.toBuffer(),
    space.toBuffer(),
  ];

  const data = Buffer.concat(buffers);

  const keys = [
    {
      pubkey: systemProgramId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: payerKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: nameKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: nameOwnerKey,
      isSigner: false,
      isWritable: false,
    },
  ];

  if (nameClassKey) {
    keys.push({
      pubkey: nameClassKey,
      isSigner: true,
      isWritable: false,
    });
  } else {
    keys.push({
      pubkey: new PublicKey(Buffer.alloc(32)),
      isSigner: false,
      isWritable: false,
    });
  }
  if (nameParent) {
    keys.push({
      pubkey: nameParent,
      isSigner: false,
      isWritable: false,
    });
  } else {
    keys.push({
      pubkey: new PublicKey(Buffer.alloc(32)),
      isSigner: false,
      isWritable: false,
    });
  }
  if (nameParentOwner) {
    keys.push({
      pubkey: nameParentOwner,
      isSigner: true,
      isWritable: false,
    });
  }

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}

export function updateInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  offset: Numberu32,
  input_data: Buffer,
  nameUpdateSigner: PublicKey
): TransactionInstruction {
  const buffers = [
    Buffer.from(Int8Array.from([1])),
    offset.toBuffer(),
    //@ts-ignore
    new Numberu32(input_data.length).toBuffer(),
    input_data,
  ];

  const data = Buffer.concat(buffers);
  const keys = [
    {
      pubkey: nameAccountKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: nameUpdateSigner,
      isSigner: true,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}

export function transferInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  newOwnerKey: PublicKey,
  currentNameOwnerKey: PublicKey,
  nameClassKey?: PublicKey,
  nameParent?: PublicKey,
  parentOwner?: PublicKey
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([2])), newOwnerKey.toBuffer()];

  const data = Buffer.concat(buffers);

  const keys = [
    {
      pubkey: nameAccountKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: parentOwner ? parentOwner : currentNameOwnerKey,
      isSigner: true,
      isWritable: false,
    },
  ];

  if (nameClassKey) {
    keys.push({
      pubkey: nameClassKey,
      isSigner: true,
      isWritable: false,
    });
  }

  if (parentOwner && nameParent) {
    if (!nameClassKey) {
      keys.push({
        pubkey: PublicKey.default,
        isSigner: false,
        isWritable: false,
      });
    }
    keys.push({
      pubkey: nameParent,
      isSigner: false,
      isWritable: false,
    });
  }

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}

export function deleteInstruction(
  nameProgramId: PublicKey,
  nameAccountKey: PublicKey,
  refundTargetKey: PublicKey,
  nameOwnerKey: PublicKey
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([3]))];

  const data = Buffer.concat(buffers);
  const keys = [
    {
      pubkey: nameAccountKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: nameOwnerKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: refundTargetKey,
      isSigner: false,
      isWritable: true,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: nameProgramId,
    data,
  });
}

export class createV2Instruction {
  tag: number;
  name: string;
  space: number;

  static schema: Schema = new Map([
    [
      createV2Instruction,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["name", "string"],
          ["space", "u32"],
        ],
      },
    ],
  ]);

  constructor(obj: { name: string; space: number }) {
    this.tag = 9;
    this.name = obj.name;
    this.space = obj.space;
  }

  serialize(): Uint8Array {
    return serialize(createV2Instruction.schema, this);
  }

  getInstruction(
    programId: PublicKey,
    rentSysvarAccount: PublicKey,
    nameProgramId: PublicKey,
    rootDomain: PublicKey,
    nameAccount: PublicKey,
    reverseLookupAccount: PublicKey,
    centralState: PublicKey,
    buyer: PublicKey,
    buyerTokenAccount: PublicKey,
    usdcVault: PublicKey,
    state: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    const keys = [
      {
        pubkey: rentSysvarAccount,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: nameProgramId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: rootDomain,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: nameAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: reverseLookupAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: centralState,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: buyer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: buyerTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: usdcVault,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: state,
        isSigner: false,
        isWritable: false,
      },
    ];

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}

export class createReverseInstruction {
  tag: number;
  name: string;

  static schema: Schema = new Map([
    [
      createReverseInstruction,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  constructor(obj: { name: string }) {
    this.tag = 5;
    this.name = obj.name;
  }

  serialize(): Uint8Array {
    return serialize(createReverseInstruction.schema, this);
  }

  getInstruction(
    programId: PublicKey,
    rentSysvarAccount: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    reverseLookupAccount: PublicKey,
    centralStateAccount: PublicKey,
    feePayer: PublicKey,
    parentName?: PublicKey,
    parentNameOwner?: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys = [
      {
        pubkey: rentSysvarAccount,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: namingServiceProgram,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: rootDomain,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: reverseLookupAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: PublicKey.default,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: centralStateAccount,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: feePayer,
        isSigner: true,
        isWritable: true,
      },
    ];

    if (parentName) {
      if (!parentNameOwner) {
        throw new Error("Missing parent name owner");
      }
      keys.push({
        pubkey: parentName,
        isSigner: false,
        isWritable: true,
      });
      keys.push({
        pubkey: parentNameOwner,
        isSigner: true,
        isWritable: false,
      });
    }

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
