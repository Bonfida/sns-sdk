<template>
  <UsageExample :name="fileName">
    <label class="block mb-4">
      Enter owner pubkey:

      <input
        v-model="formValue"
        class="p-2 outline-none"
        placeholder="Enter value"
      />
    </label>

    <div>Result: {{ isLoading ? 'Loading...' : result }}</div>
  </UsageExample>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useFavoriteDomain } from '@bonfida/sns-vue';
import { useSolanaConnection } from '../../utils/solana';
import UsageExample from '../usage-example.vue';

const connection = useSolanaConnection();

const fileName = import.meta.url.match(/\/([^\/]+)\.vue/)?.[1] || '';
const formValue = ref('');
const debouncedFormValue = refDebounced(formValue, 500);

const { result, isLoading } = useFavoriteDomain(
  connection!,
  debouncedFormValue,
);
</script>
