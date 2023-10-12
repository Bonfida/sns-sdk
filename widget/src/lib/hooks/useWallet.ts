import { useWallet as useWalletAdapterReact } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";

export const useWallet = () => {
  const wallet = useWalletAdapterReact();
  const { connection } = useConnection();

  const { visible, setVisible } = useWalletModal();

  return {
    visible,
    setVisible,
    connection,
    ...wallet,
  };
};
