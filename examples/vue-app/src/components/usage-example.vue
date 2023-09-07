<template>
  <div
    class="relative p-4 pt-8 border border-white border-opacity-10 w-[800px]"
  >
    <div
      class="absolute -top-[1px] -left-[1px] p-1 text-sm text-white border border-white"
    >
      {{ name }}
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>
