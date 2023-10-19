import { Connection } from "@solana/web3.js";
import { createContext, PropsWithChildren, ReactNode, useContext } from "react";
import {
  useWallet as useWalletAdapterReact,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { WalletPassThroughProps } from "../types";

interface WalletPassThroughStructure extends WalletPassThroughProps {
  connection: Connection | null;
}

const initialPassThrough: WalletPassThroughStructure = {
  publicKey: null,
  wallets: [],
  wallet: null,
  connect: async () => {},
  select: () => {},
  connecting: false,
  connected: false,
  disconnect: async () => {},
  visible: false,
  setVisible: () => {},
  connection: null,
  signAllTransactions: async (T) => T,
};

export const WalletPassthroughContext =
  createContext<WalletPassThroughStructure>(initialPassThrough);

export function useWalletPassThrough(): WalletPassThroughStructure {
  return useContext(WalletPassthroughContext);
}

const FromWalletAdapter = ({ children }: PropsWithChildren) => {
  const wallet = useWalletAdapterReact();
  const { connection } = useConnection();

  const { visible, setVisible } = useWalletModal();

  const contextValue: WalletPassThroughStructure = {
    visible,
    setVisible,
    connection,
    ...wallet,
  };

  return (
    <WalletPassthroughContext.Provider value={contextValue}>
      {children}
    </WalletPassthroughContext.Provider>
  );
};

interface WalletPassthroughProviderProps {
  children: ReactNode;
  passthroughWallet?: WalletPassThroughProps;
}

export const WalletPassthroughProvider = ({
  children,
  passthroughWallet,
}: WalletPassthroughProviderProps) => {
  const { connection } = useConnection();

  if (!passthroughWallet) {
    return <FromWalletAdapter>{children}</FromWalletAdapter>;
  }

  if (passthroughWallet) {
    return (
      <WalletPassthroughContext.Provider
        value={{ ...passthroughWallet, connection }}
      >
        {children}
      </WalletPassthroughContext.Provider>
    );
  }

  return <>{children}</>;
};
