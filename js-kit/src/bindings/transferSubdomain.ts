import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";

import { NAME_PROGRAM_ID } from "../constants";
import { InvalidSubdomainError } from "../error";
import { transferInstruction } from "../instructions/transferInstruction";
import { NameRegistryState } from "../state";
import { getDomainKeySync } from "../utils/getDomainKeySync";

/**
 * This function is used to transfer the ownership of a subdomain in the Solana Name Service.
 *
 * @param {Connection} connection - The Solana RPC connection object.
 * @param {string} subdomain - The subdomain to transfer. It can be with or without .sol suffix (e.g., 'something.bonfida.sol' or 'something.bonfida').
 * @param {PublicKey} newOwner - The public key of the new owner of the subdomain.
 * @param {boolean} [isParentOwnerSigner=false] - A flag indicating whether the parent name owner is signing this transfer.
 * @param {PublicKey} [owner] - The public key of the current owner of the subdomain. This is an optional parameter. If not provided, the owner will be resolved automatically. This can be helpful to build transactions when the subdomain does not exist yet.
 *
 * @returns {Promise<TransactionInstruction>} - A promise that resolves to a Solana instruction for the transfer operation.
 */
export const transferSubdomain = async (
  connection: Connection,
  subdomain: string,
  newOwner: Address,
  isParentOwnerSigner?: boolean,
  owner?: Address
): Promise<TransactionInstruction> => {
  const { pubkey, isSub, parent } = getDomainKeySync(subdomain);

  if (!parent || !isSub) {
    throw new InvalidSubdomainError("The subdomain is not valid");
  }

  if (!owner) {
    const { registry } = await NameRegistryState.retrieve(connection, pubkey);
    owner = registry.owner;
  }

  let nameParent: PublicKey | undefined = undefined;
  let nameParentOwner: PublicKey | undefined = undefined;

  if (isParentOwnerSigner) {
    nameParent = parent;
    nameParentOwner = (await NameRegistryState.retrieve(connection, parent))
      .registry.owner;
  }

  const ix = transferInstruction(
    NAME_PROGRAM_ID,
    pubkey,
    newOwner,
    owner,
    undefined,
    nameParent,
    nameParentOwner
  );

  return ix;
};
