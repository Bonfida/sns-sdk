import { WalletClose } from "react-huge-icons/outline";
import { useWalletPassThrough } from "../contexts/wallet-passthrough-provider";
import { abbreviate } from "../utils";

export const ConnectWalletButton = () => {
  const { visible, setVisible, connected, publicKey } = useWalletPassThrough();

  return (
    <button
      type="button"
      className="flex items-center gap-2 px-3 py-2 ml-auto text-xs tracking-wide rounded-lg bg-theme-secondary font-primary text-theme-primary"
      tabIndex={0}
      onClick={() => setVisible(!visible)}
    >
      <WalletClose width={16} height={16} />
      {connected ? abbreviate(publicKey?.toString(), 8, 4) : "Connect wallet"}
    </button>
  );
};
