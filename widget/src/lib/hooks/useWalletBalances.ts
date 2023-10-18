import { useCallback, useEffect, useState } from "react";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useWalletPassThrough } from "../contexts/wallet-passthrough-provider";
import { tokenList } from "../utils";

const getTokenAccountBalance = async (
  connection: Connection,
  key: PublicKey,
): Promise<number> => {
  try {
    const balances = await connection.getTokenAccountBalance(key);
    return balances?.value?.uiAmount || 0;
  } catch (err) {
    return 0;
  }
};

export const useWalletBalances = () => {
  const { publicKey, connection } = useWalletPassThrough();

  const [balances, setBalances] = useState<Record<string, number>>({});

  const loadBalances = useCallback(async () => {
    if (publicKey) {
      const balances: Record<string, number> = {};

      for (const token of tokenList) {
        const mint = new PublicKey(token.mintAddress);
        const ata = getAssociatedTokenAddressSync(mint, publicKey);
        const balance = await getTokenAccountBalance(connection!, ata);

        if (mint.equals(NATIVE_MINT)) {
          const sol =
            (await connection!.getBalance(publicKey)) / LAMPORTS_PER_SOL;

          balances[token.tokenSymbol] = sol + balance;
        } else {
          balances[token.tokenSymbol] = balance;
        }
      }

      setBalances(balances);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    loadBalances();
  }, [publicKey, connection, loadBalances]);

  return {
    balances,
  };
};
