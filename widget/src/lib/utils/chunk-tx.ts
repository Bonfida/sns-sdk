import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

const MAX = 1_232;

export const chunkIx = (
  instructions: TransactionInstruction[],
  buyer: PublicKey,
  blockhash = "48tzUutUCPDohF4YqFpX9dHHS43V1bn9R45LHEFVhbtq",
) => {
  const result: TransactionInstruction[][] = [];
  let temp: TransactionInstruction[] = [];

  for (const ix of instructions) {
    const size = getSize([...temp, ix], buyer, blockhash);
    if (size > MAX) {
      result.push(temp);
      temp = [ix];
    } else {
      temp.push(ix);
    }
  }

  if (temp.length > 0) {
    result.push(temp);
  }

  return result;
};

const getSize = (
  instructions: TransactionInstruction[],
  buyer: PublicKey,
  blockhash = "48tzUutUCPDohF4YqFpX9dHHS43V1bn9R45LHEFVhbtq",
) => {
  try {
    const tx = new Transaction().add(...instructions);
    tx.recentBlockhash = blockhash;
    tx.feePayer = buyer;
    return tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).length;
  } catch (err) {
    return MAX + 1;
  }
};
