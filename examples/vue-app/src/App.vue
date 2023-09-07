<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { WalletMultiButton } from 'solana-wallets-vue';
import { useDomainOwner } from '@bonfida/sns-vue';
import { useSolanaConnection } from './utils/solana';

const connection = useSolanaConnection();

const domainName = ref('');
const debouncedDomainName = refDebounced(domainName);

const owner = useDomainOwner(connection!, debouncedDomainName);
</script>

<template>
  <div class="root-page">
    <WalletMultiButton />

    <div class="features-list">
      <div class="features-row">
        <label>
          Enter domain name
          <input v-model="domainName" />
        </label>

        <div>Owner: {{ owner }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.root-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.features-list {
  display: grid;
  gap: 24px;
  max-width: 600px;
}
.features-row {
  padding: 24px;
  display: grid;
  gap: 12px;
}
</style>
