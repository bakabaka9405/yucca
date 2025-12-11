<script setup lang="ts">
import { Suspense } from 'vue'
import Viewer from './components/Viewer.vue'
</script>

<template>
  <Suspense>
    <Viewer />
  </Suspense>
</template>

<style scoped></style>
