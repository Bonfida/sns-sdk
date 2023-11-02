import { ReactNode, useState } from "react";
import {
  // ConnectionProvider,
  // useConnection,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import Widget from "./lib";

import "@solana/wallet-adapter-react-ui/styles.css";

const PUBLIC_RPC = import.meta.env.VITE_PUBLIC_RPC as string;

const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return (
    // <ConnectionProvider endpoint={PUBLIC_RPC}>
    <WalletProvider autoConnect wallets={[]}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
    //</ConnectionProvider>
  );
};

const Content = () => {
  const wallet = useWallet();
  // const { connection } = useConnection();
  const { visible, setVisible } = useWalletModal();
  const [isDark, toggleDark] = useState(false);

  return (
    <>
      <button
        style={{
          backgroundColor: "white",
          color: "black",
        }}
        onClick={() => toggleDark(!isDark)}
      >
        Toggle dark
      </button>

      <Widget
        // connection={connection}
        endpoint={PUBLIC_RPC}
        passthroughWallet={{ ...wallet, visible, setVisible }}
        isDark={isDark}
      />
    </>
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
