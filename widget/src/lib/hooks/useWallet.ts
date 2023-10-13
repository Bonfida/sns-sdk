import {
  useWallet as useWalletAdapterReact,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

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
