import { Connection, PublicKey } from "@solana/web3.js";
import { createContext, PropsWithChildren, ReactNode, useContext } from "react";
import type {
  WalletName,
  SignerWalletAdapterProps,
} from "@solana/wallet-adapter-base";
import {
  useWallet as useWalletAdapterReact,
  useConnection,
  type Wallet,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export interface WalletPassThroughProps {
  publicKey: PublicKey | null | undefined;
  wallets: Wallet[];
  wallet: Wallet | null;
  connect: () => Promise<void>;
  select: (walletName: WalletName) => void;
  connecting: boolean;
  connected: boolean;
  disconnect: () => Promise<void>;
  signAllTransactions:
    | SignerWalletAdapterProps["signAllTransactions"]
    | undefined;

  visible: boolean;
  setVisible: (visible: boolean) => void;
}

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
