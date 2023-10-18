import { Buffer } from "buffer";
import type { CSSProperties } from "react";
import { CartContextProvider } from "./contexts/cart";
import { type WalletPassThroughProps } from "./contexts/wallet-passthrough-provider";
import { GlobalStatusContextProvider } from "./contexts/status-messages";
import { SolanaProvider } from "./contexts/solana";
import { WidgetHome } from "./views/home";

// TODO: check if possible to avoid doing that
window.Buffer = Buffer;

interface WidgetProps {
  endpoint: string;
  passthroughWallet?: WalletPassThroughProps;
  containerStyles?: CSSProperties;
}

const Widget = ({ endpoint, passthroughWallet }: WidgetProps) => {
  return (
    <SolanaProvider endpoint={endpoint} passthroughWallet={passthroughWallet}>
      <CartContextProvider>
        <GlobalStatusContextProvider>
          <WidgetHome />
        </GlobalStatusContextProvider>
      </CartContextProvider>
    </SolanaProvider>
  );
};

export default Widget;
