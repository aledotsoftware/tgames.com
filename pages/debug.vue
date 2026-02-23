<template>
  <div>
    <h1>Debug Page</h1>
    <p>Current Locale: {{ locale }}</p>
    <p>Route: {{ route.path }}</p>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const route = useRoute()
</script>
