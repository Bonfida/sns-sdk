import { useState, type CSSProperties, lazy, Suspense } from "react";
import type { PublicKey } from "@solana/web3.js";
import type {
  WalletName,
  SignerWalletAdapterProps,
} from "@solana/wallet-adapter-base";
import type { Wallet } from "@solana/wallet-adapter-react";
// import { type WalletPassThroughProps } from "./contexts/wallet-passthrough-provider";

interface WalletPassThroughProps {
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

interface WidgetProps {
  endpoint: string;
  passthroughWallet?: WalletPassThroughProps;
  containerStyles?: CSSProperties;
}

const Widget = lazy(() => import(`./widget`));

const EntryPoint = (props: WidgetProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fixed bottom-3 right-3">
      <button onClick={() => setVisible(!visible)} className="text-[#fff]">
        Widget
      </button>

      <Suspense>{visible && <Widget {...props} />}</Suspense>
    </div>
  );
};

export type { WidgetProps };
export default EntryPoint;
