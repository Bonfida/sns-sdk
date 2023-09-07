<template>
  <UsageExample name="useDomainOwner">
    <label class="block mb-4">
      Enter domain name:

      <input
        v-model="domainName"
        class="p-2 outline-none"
        placeholder="Domain name"
      />
    </label>

    <div>Owner: {{ isLoading ? 'Loading...' : owner }}</div>
  </UsageExample>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useDomainOwner } from '@bonfida/sns-vue';
import { useSolanaConnection } from '../utils/solana';
import UsageExample from './usage-example.vue';

const connection = useSolanaConnection();

const domainName = ref('');
const debouncedDomainName = refDebounced(domainName);

const { owner, isLoading } = useDomainOwner(connection, debouncedDomainName);
</script>
