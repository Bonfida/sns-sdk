<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useDomainsForOwner } from '@bonfida/sns-vue';
import { useSolanaConnection } from '../utils/solana';
import UsageExample from './usage-example.vue';

const connection = useSolanaConnection();

const owner = ref('');
const debouncedOwner = refDebounced(owner);

const { domains, isLoading } = useDomainsForOwner(connection, debouncedOwner);
</script>

<template>
  <UsageExample name="useDomainsForOwner">
    <label class="block mb-4">
      Enter owner pubkey:

      <input
        v-model="owner"
        class="p-2 outline-none w-[300px]"
        placeholder="Owner pubkey"
      />
    </label>

    <div class="mb-4">Domains:</div>

    <template v-if="!domains.length && !isLoading"> No data </template>
    <template v-else-if="isLoading">
      <p>Loading...</p>
    </template>
    <template v-else>
      <div class="max-h-[300px] overflow-auto">
        <teble>
          <tr>
            <td>Domain name</td>
            <td>Pubkey</td>
          </tr>
          <template v-for="domain in domains" :key="domain.domain">
            <tr>
              <td>{{ domain.domain }}</td>
              <td>{{ domain.pubkey }}</td>
            </tr>
          </template>
        </teble>
      </div>
    </template>
  </UsageExample>
</template>
