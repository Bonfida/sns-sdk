import { Buffer } from "buffer";
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Numberu32, Numberu64 } from "./int";
import { serialize } from "borsh";

export interface AccountKey {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}

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
  nameParentOwner?: PublicKey,
): TransactionInstruction {
  const buffers = [
    Buffer.from(Int8Array.from([0])),
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
  nameUpdateSigner: PublicKey,
): TransactionInstruction {
  const buffers = [
    Buffer.from(Int8Array.from([1])),
    offset.toBuffer(),
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
  parentOwner?: PublicKey,
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
  nameOwnerKey: PublicKey,
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

  static schema = {
    struct: {
      tag: "u8",
      name: "string",
      space: "u32",
    },
  };

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
    state: PublicKey,
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
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
    },
  };

  constructor(obj: { name: string }) {
    this.tag = 12;
    this.name = obj.name;
  }
  serialize(): Uint8Array {
    return serialize(createReverseInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    reverseLookup: PublicKey,
    systemProgram: PublicKey,
    centralState: PublicKey,
    feePayer: PublicKey,
    rentSysvar: PublicKey,
    parentName?: PublicKey,
    parentNameOwner?: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: namingServiceProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rootDomain,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: reverseLookup,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: rentSysvar,
      isSigner: false,
      isWritable: false,
    });
    if (!!parentName) {
      keys.push({
        pubkey: parentName,
        isSigner: false,
        isWritable: true,
      });
    }
    if (!!parentNameOwner) {
      keys.push({
        pubkey: parentNameOwner,
        isSigner: true,
        isWritable: true,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
export class createInstructionV3 {
  tag: number;
  name: string;
  space: number;
  referrerIdxOpt: number | null;
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
      space: "u32",
      referrerIdxOpt: { option: "u16" },
    },
  };

  constructor(obj: {
    name: string;
    space: number;
    referrerIdxOpt: number | null;
  }) {
    this.tag = 13;
    this.name = obj.name;
    this.space = obj.space;
    this.referrerIdxOpt = obj.referrerIdxOpt;
  }
  serialize(): Uint8Array {
    return serialize(createInstructionV3.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    name: PublicKey,
    reverseLookup: PublicKey,
    systemProgram: PublicKey,
    centralState: PublicKey,
    buyer: PublicKey,
    buyerTokenSource: PublicKey,
    pythMappingAcc: PublicKey,
    pythProductAcc: PublicKey,
    pythPriceAcc: PublicKey,
    vault: PublicKey,
    splTokenProgram: PublicKey,
    rentSysvar: PublicKey,
    state: PublicKey,
    referrerAccountOpt?: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: namingServiceProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rootDomain,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: name,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: reverseLookup,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: buyer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: buyerTokenSource,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: pythMappingAcc,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: pythProductAcc,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: pythPriceAcc,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: vault,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: splTokenProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rentSysvar,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: state,
      isSigner: false,
      isWritable: false,
    });
    if (!!referrerAccountOpt) {
      keys.push({
        pubkey: referrerAccountOpt,
        isSigner: false,
        isWritable: true,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}

export class createWithNftInstruction {
  tag: number;
  name: string;
  space: number;
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
      space: "u32",
    },
  };

  constructor(obj: { name: string; space: number }) {
    this.tag = 17;
    this.name = obj.name;
    this.space = obj.space;
  }
  serialize(): Uint8Array {
    return serialize(createWithNftInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    name: PublicKey,
    reverseLookup: PublicKey,
    systemProgram: PublicKey,
    centralState: PublicKey,
    buyer: PublicKey,
    nftSource: PublicKey,
    nftMetadata: PublicKey,
    nftMint: PublicKey,
    masterEdition: PublicKey,
    collection: PublicKey,
    splTokenProgram: PublicKey,
    rentSysvar: PublicKey,
    state: PublicKey,
    mplTokenMetadata: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: namingServiceProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rootDomain,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: name,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: reverseLookup,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: buyer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: nftSource,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: nftMetadata,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: nftMint,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: masterEdition,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: collection,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: splTokenProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rentSysvar,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: state,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: mplTokenMetadata,
      isSigner: false,
      isWritable: false,
    });
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}

export class burnInstruction {
  tag: number;
  static schema = {
    struct: {
      tag: "u8",
    },
  };

  constructor() {
    this.tag = 16;
  }
  serialize(): Uint8Array {
    return serialize(burnInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    nameServiceId: PublicKey,
    systemProgram: PublicKey,
    domain: PublicKey,
    reverse: PublicKey,
    resellingState: PublicKey,
    state: PublicKey,
    centralState: PublicKey,
    owner: PublicKey,
    target: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: nameServiceId,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: domain,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: reverse,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: resellingState,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: state,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: owner,
      isSigner: true,
      isWritable: false,
    });
    keys.push({
      pubkey: target,
      isSigner: false,
      isWritable: true,
    });
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}

export function reallocInstruction(
  nameProgramId: PublicKey,
  systemProgramId: PublicKey,
  payerKey: PublicKey,
  nameAccountKey: PublicKey,
  nameOwnerKey: PublicKey,
  space: Numberu32,
): TransactionInstruction {
  const buffers = [Buffer.from(Int8Array.from([4])), space.toBuffer()];

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
      pubkey: nameAccountKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: nameOwnerKey,
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

export class registerFavoriteInstruction {
  tag: number;
  static schema = {
    struct: {
      tag: "u8",
    },
  };
  constructor() {
    this.tag = 6;
  }
  serialize(): Uint8Array {
    return serialize(registerFavoriteInstruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    nameAccount: PublicKey,
    favouriteAccount: PublicKey,
    owner: PublicKey,
    systemProgram: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: nameAccount,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: favouriteAccount,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: owner,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}

export class createSplitV2Instruction {
  tag: number;
  name: string;
  space: number;
  referrerIdxOpt: number | null;
  static schema = {
    struct: {
      tag: "u8",
      name: "string",
      space: "u32",
      referrerIdxOpt: { option: "u16" },
    },
  };
  constructor(obj: {
    name: string;
    space: number;
    referrerIdxOpt: number | null;
  }) {
    this.tag = 20;
    this.name = obj.name;
    this.space = obj.space;
    this.referrerIdxOpt = obj.referrerIdxOpt;
  }
  serialize(): Uint8Array {
    return serialize(createSplitV2Instruction.schema, this);
  }
  getInstruction(
    programId: PublicKey,
    namingServiceProgram: PublicKey,
    rootDomain: PublicKey,
    name: PublicKey,
    reverseLookup: PublicKey,
    systemProgram: PublicKey,
    centralState: PublicKey,
    buyer: PublicKey,
    domainOwner: PublicKey,
    feePayer: PublicKey,
    buyerTokenSource: PublicKey,
    pythFeedAccount: PublicKey,
    vault: PublicKey,
    splTokenProgram: PublicKey,
    rentSysvar: PublicKey,
    state: PublicKey,
    referrerAccountOpt?: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.from(this.serialize());
    let keys: AccountKey[] = [];
    keys.push({
      pubkey: namingServiceProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rootDomain,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: name,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: reverseLookup,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: systemProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: centralState,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: buyer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: domainOwner,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    });
    keys.push({
      pubkey: buyerTokenSource,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: pythFeedAccount,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: vault,
      isSigner: false,
      isWritable: true,
    });
    keys.push({
      pubkey: splTokenProgram,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: rentSysvar,
      isSigner: false,
      isWritable: false,
    });
    keys.push({
      pubkey: state,
      isSigner: false,
      isWritable: false,
    });
    if (!!referrerAccountOpt) {
      keys.push({
        pubkey: referrerAccountOpt,
        isSigner: false,
        isWritable: true,
      });
    }
    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }
}
