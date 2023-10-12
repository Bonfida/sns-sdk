import {
  PublicKey,
  Connection,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token";

export const wrapSol = async (
  connection: Connection,
  ata: PublicKey,
  owner: PublicKey,
  amount: number
) => {
  let transferAmount = amount;
  const instructions: TransactionInstruction[] = [];

  const nativeBalances = await connection.getBalance(owner);

  const info = await connection.getAccountInfo(ata);
  if (!info || !info.data) {
    const ix = createAssociatedTokenAccountInstruction(
      owner,
      ata,
      owner,
      NATIVE_MINT
    );
    instructions.push(ix);
  } else {
    const balance = await connection.getTokenAccountBalance(ata, "processed");
    if (nativeBalances + parseInt(balance.value.amount) < amount) {
      throw new Error("Not enough SOL balances");
    }
    transferAmount -= parseInt(balance.value.amount);
    if (transferAmount <= 0) {
      console.log(`Enough wrapped SOL`);
      return [];
    }
  }

  let ix = SystemProgram.transfer({
    fromPubkey: owner,
    toPubkey: ata,
    lamports: transferAmount,
  });
  instructions.push(ix);

  ix = createSyncNativeInstruction(ata);
  instructions.push(ix);

  return instructions;
};
