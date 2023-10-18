import { ReactNode } from "react";
import {
  // ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { WidgetRoot } from "./lib";

import "@solana/wallet-adapter-react-ui/styles.css";

const PUBLIC_RPC = import.meta.env.VITE_PUBLIC_RPC as string;

const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WalletProvider autoConnect wallets={[]}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
};

const Content = () => {
  const wallet = useWallet();
  const { visible, setVisible } = useWalletModal();

  return (
    <WidgetRoot
      endpoint={PUBLIC_RPC}
      passthroughWallet={{ ...wallet, visible, setVisible }}
    />
  );
};

function App() {
  return (
    <SolanaProvider>
      <Content />
    </SolanaProvider>
  );
}

export default App;
