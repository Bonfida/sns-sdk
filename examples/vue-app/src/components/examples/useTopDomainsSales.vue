<template>
  <UsageExample :name="fileName">
    <label class="block mb-4"> Top sales for last months </label>

    <template v-if="isLoading"> Loading... </template>
    <template v-else>
      <table>
        <thead>
          <tr>
            <td>Domain name</td>
            <td>| Price, $</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item of result || []" :key="item.domain">
            <td>{{ item.domain }}</td>
            <td>| ${{ item.price }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </UsageExample>
</template>

<script setup lang="ts">
import { useTopDomainsSales } from "@bonfida/sns-vue";
import UsageExample from "../usage-example.vue";

const fileName = import.meta.url.match(/\/([^\/]+)\.vue/)?.[1] || "";

const { result, isLoading } = useTopDomainsSales();
</script>
