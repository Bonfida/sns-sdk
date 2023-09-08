<script setup lang="ts">
import { WalletMultiButton } from 'solana-wallets-vue';
import UseDomainOwnerExample from './components/useDomainOwner-example.vue';
import UseDomainsForOwnerExample from './components/useDomainsForOwner-example.vue';
import UseDomainSizeExample from './components/useDomainSize-example.vue';
</script>

<template>
  <div class="root-page">
    <WalletMultiButton />

    <div class="grid gap-6">
      <UseDomainOwnerExample />
      <UseDomainsForOwnerExample />
      <UseDomainSizeExample />
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
.features-row {
  padding: 24px;
  display: grid;
  gap: 12px;
}
</style>
