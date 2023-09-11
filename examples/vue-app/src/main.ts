import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import { initSolanaConnection } from './utils/solana';

initSolanaConnection();

createApp(App).mount('#app')
