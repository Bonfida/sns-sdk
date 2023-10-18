import { ReactNode, useMemo, Fragment } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  WalletPassthroughProvider,
  type WalletPassThroughProps,
} from "./wallet-passthrough-provider";

import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaProvider = ({
  children,
  endpoint,
  passthroughWallet,
}: {
  children: ReactNode;
  endpoint: string;
  passthroughWallet?: WalletPassThroughProps;
}) => {
  const wallets = useMemo(() => [], []);

  const ShouldWrapWalletProvider = useMemo(() => {
    if (!passthroughWallet) {
      return ({ children }: { children: ReactNode }) => (
        <WalletProvider wallets={wallets} autoConnect>
          {children}
        </WalletProvider>
      );
    }
    return Fragment;
  }, [passthroughWallet]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <ShouldWrapWalletProvider>
        <WalletModalProvider>
          <WalletPassthroughProvider passthroughWallet={passthroughWallet}>
            {children}
          </WalletPassthroughProvider>
        </WalletModalProvider>
      </ShouldWrapWalletProvider>
    </ConnectionProvider>
  );
};
