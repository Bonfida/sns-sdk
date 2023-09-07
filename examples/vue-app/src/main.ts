import { createApp } from 'vue'
import SolanaWallets from "solana-wallets-vue";
import './style.css'
import App from './app.vue'
import { initSolanaConnection } from './utils/solana';

import "solana-wallets-vue/styles.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

const walletOptions = {
  wallets: [
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
  ],
  autoConnect: true,
};

initSolanaConnection();

const app = createApp(App);

app.use(SolanaWallets, walletOptions)

app.mount('#app')
