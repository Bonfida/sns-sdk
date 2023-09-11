<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const components = import.meta.glob('./components/examples/*.vue');
const asyncComponents = Object.keys(components).map((path) =>
  defineAsyncComponent(() => import(/* @vite-ignore */ path)),
);
</script>

<template>
  <div class="root-page">
    <div class="grid gap-6">
      <template v-for="component in asyncComponents">
        <component :is="component" />
      </template>
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
