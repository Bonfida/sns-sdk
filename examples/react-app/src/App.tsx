import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Example } from "./Example";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export const RPC_URL = import.meta.env.VITE_RPC as string;

const queryClient = new QueryClient();

function App() {
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);
  return (
    <div className="min-h-screen bg-[#333]">
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={RPC_URL}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <div className="flex px-10 py-20 space-x-3">
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
              <Example />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
