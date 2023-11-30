<template>
  <UsageExample :name="fileName">
    <label class="block mb-4">
      Enter domain name:

      <input
        v-model="formValue"
        class="p-2 outline-none"
        placeholder="Enter value"
      />
    </label>
    {{ isLoading }}

    <div>Result: {{ isLoading ? "Loading..." : result }}</div>
  </UsageExample>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { refDebounced } from "@vueuse/core";
import { useSearch } from "@bonfida/sns-vue";
import { useSolanaConnection } from "../../utils/solana";
import UsageExample from "../usage-example.vue";

const connection = useSolanaConnection();

const fileName = import.meta.url.match(/\/([^\/]+)\.vue/)?.[1] || "";
const formValue = ref("");
const debouncedFormValue = refDebounced(formValue, 500);

const { result, isLoading } = useSearch({
  connection: connection!,
  domain: debouncedFormValue,
});
</script>
