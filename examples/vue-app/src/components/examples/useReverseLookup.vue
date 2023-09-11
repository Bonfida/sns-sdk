<template>
  <UsageExample :name="fileName">
    <label class="block mb-4">
      Enter pubKey:

      <input
        v-model="formValue"
        class="w-[500px] p-2 outline-none"
        placeholder="Enter value"
      />
    </label>

    <div>Result: {{ isLoading ? 'Loading...' : result }}</div>
  </UsageExample>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { PublicKey } from '@solana/web3.js';
import { useReverseLookup } from '@bonfida/sns-vue';
import { useSolanaConnection } from '../../utils/solana';
import UsageExample from '../usage-example.vue';

const connection = useSolanaConnection();

const fileName = import.meta.url.match(/\/([^\/]+)\.vue/)?.[1] || '';
const formValue = ref('');
const debouncedFormValue = refDebounced(formValue, 500);
const pubKey = computed(() =>
  debouncedFormValue.value ? new PublicKey(debouncedFormValue.value) : null,
);

const { result, isLoading } = useReverseLookup(connection!, pubKey);
</script>
