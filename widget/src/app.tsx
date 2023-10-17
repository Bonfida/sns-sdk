import { ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WidgetRoot } from "./lib";

import "@solana/wallet-adapter-react-ui/styles.css";

const PUBLIC_RPC = import.meta.env.VITE_PUBLIC_RPC as string;

const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ConnectionProvider endpoint={PUBLIC_RPC}>
      <WalletProvider autoConnect wallets={[]}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

function App() {
  return (
    <SolanaProvider>
      <WidgetRoot />
    </SolanaProvider>
  );
}

export default App;
