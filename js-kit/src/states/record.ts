import {
  Address,
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  Rpc,
  fetchEncodedAccount,
  fetchEncodedAccounts,
} from "@solana/kit";
import { Schema, deserialize } from "borsh";

import { Validation } from "../types/validation";

export const NAME_REGISTRY_LEN = 96;

export const getValidationLength = (validation: Validation) => {
  switch (validation) {
    case Validation.None:
      return 0;
    case Validation.Ethereum:
      return 20;
    case Validation.Solana:
      return 32;
    case Validation.UnverifiedSolana:
      return 32;
    default:
      throw new Error("Invalid validation enum");
  }
};

export class RecordHeaderState {
  stalenessValidation: number;
  rightOfAssociationValidation: number;
  contentLength: number;

  static LEN = 8;

  static schema: Schema = {
    struct: {
      stalenessValidation: "u16",
      rightOfAssociationValidation: "u16",
      contentLength: "u32",
    },
  };

  constructor(obj: {
    stalenessValidation: number;
    rightOfAssociationValidation: number;
    contentLength: number;
  }) {
    this.stalenessValidation = obj.stalenessValidation;
    this.rightOfAssociationValidation = obj.rightOfAssociationValidation;
    this.contentLength = obj.contentLength;
  }

  static deserialize(data: Uint8Array): RecordHeaderState {
    return new RecordHeaderState(deserialize(this.schema, data, true) as any);
  }

  static async retrieve(
    rpc: Rpc<GetAccountInfoApi>,
    address: Address
  ): Promise<RecordHeaderState> {
    const recordHeaderAccount = await fetchEncodedAccount(rpc, address);

    if (!recordHeaderAccount.exists) {
      throw new Error("Record header account not found");
    }

    return this.deserialize(
      recordHeaderAccount.data.slice(
        NAME_REGISTRY_LEN,
        NAME_REGISTRY_LEN + this.LEN
      )
    );
  }
}

export class RecordState {
  header: RecordHeaderState;
  data: Uint8Array;

  constructor(header: RecordHeaderState, data: Uint8Array) {
    this.data = data;
    this.header = header;
  }

  static deserialize(data: Uint8Array): RecordState {
    const offset = NAME_REGISTRY_LEN;
    const header = RecordHeaderState.deserialize(
      data.slice(offset, offset + RecordHeaderState.LEN)
    );

    return new RecordState(header, data.slice(offset + RecordHeaderState.LEN));
  }

  static async retrieve(
    rpc: Rpc<GetAccountInfoApi>,
    address: Address
  ): Promise<RecordState> {
    const recordAccount = await fetchEncodedAccount(rpc, address);
    if (!recordAccount.exists) {
      throw new Error("Record account not found");
    }

    return this.deserialize(recordAccount.data);
  }

  static async retrieveBatch(
    rpc: Rpc<GetMultipleAccountsApi>,
    addresses: Address[]
  ): Promise<(RecordState | undefined)[]> {
    const recordAccounts = await fetchEncodedAccounts(rpc, addresses);

    return recordAccounts.map((account) =>
      account.exists ? this.deserialize(account.data) : undefined
    );
  }

  getContent(): Uint8Array {
    const startOffset =
      getValidationLength(this.header.stalenessValidation) +
      getValidationLength(this.header.rightOfAssociationValidation);

    return this.data.slice(startOffset);
  }

  getStalenessId(): Uint8Array {
    const endOffset = getValidationLength(this.header.stalenessValidation);

    return this.data.slice(0, endOffset);
  }

  getRoAId(): Uint8Array {
    const startOffset = getValidationLength(this.header.stalenessValidation);
    const endOffset =
      startOffset +
      getValidationLength(this.header.rightOfAssociationValidation);

    return this.data.slice(startOffset, endOffset);
  }
}
