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

    <template v-if="isLoading"> Loading suggestions... </template>
    <template v-else>
      <table>
        <thead>
          <tr>
            <td>Domain name</td>
            <td>| Availability</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item of result || []" :key="item.domain">
            <td>{{ item.domain }}</td>
            <td>| {{ item.available }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </UsageExample>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { refDebounced } from "@vueuse/core";
import { useDomainSuggestions } from "@bonfida/sns-vue";
import { useSolanaConnection } from "../../utils/solana";
import UsageExample from "../usage-example.vue";

const connection = useSolanaConnection();

const fileName = import.meta.url.match(/\/([^\/]+)\.vue/)?.[1] || "";
const formValue = ref("");
const debouncedFormValue = refDebounced(formValue, 500);

const { result, isLoading } = useDomainSuggestions({
  connection: connection!,
  domain: debouncedFormValue,
});
</script>
