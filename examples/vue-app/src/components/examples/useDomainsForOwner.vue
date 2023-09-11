<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useDomainsForOwner } from '@bonfida/sns-vue';
import { useSolanaConnection } from '../../utils/solana';
import UsageExample from '../usage-example.vue';

const connection = useSolanaConnection();

const fileName = import.meta.url.match(/\/([^\/]+)\.vue/)?.[1] || '';
const formValue = ref('');
const debouncedFormValue = refDebounced(formValue, 500);

const { result: domains, isLoading } = useDomainsForOwner(
  connection,
  debouncedFormValue,
);
</script>

<template>
  <UsageExample :name="fileName">
    <label class="block mb-4">
      Enter owner pubkey:

      <input
        v-model="formValue"
        class="w-[500px] p-2 outline-none"
        placeholder="Enter value"
      />
    </label>

    <div class="mb-4">Domains:</div>

    <template v-if="!domains?.length && !isLoading"> No data </template>
    <template v-else-if="isLoading">
      <p>Loading...</p>
    </template>
    <template v-else>
      <div class="max-h-[300px] overflow-auto">
        <table>
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
        </table>
      </div>
    </template>
  </UsageExample>
</template>
