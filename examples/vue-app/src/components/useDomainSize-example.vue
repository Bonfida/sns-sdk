<template>
  <UsageExample name="useDomainSize">
    <label class="block mb-4">
      Enter domain name:

      <input
        v-model="domainName"
        class="p-2 outline-none"
        placeholder="Domain name"
      />
    </label>

    <div>Domain size: {{ isLoading ? 'Loading...' : size }}</div>
  </UsageExample>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useDomainSize } from '@bonfida/sns-vue';
import { useSolanaConnection } from '../utils/solana';
import UsageExample from './usage-example.vue';

const connection = useSolanaConnection();

const domainName = ref('');
const debouncedDomainName = refDebounced(domainName);

const { result: size, isLoading } = useDomainSize(
  connection,
  debouncedDomainName,
);
</script>
