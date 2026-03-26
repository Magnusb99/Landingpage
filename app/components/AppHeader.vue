<template>
  <UHeader
    title="Byggproffs Skåne"
    class="border-none flex flex-wrap flex-row"
    :ui="{
      title: 'font-semibold text-3xl',
    }"
  >
    <template #right>
      <UButton leading-icon="gg:phone" label="Ring oss nu" variant="link" />
      <UButton label="Boka Hembesök" />
      <UButton label="RÄKNA UT OFFERT" variant="outline" to="/calc"/>
      <UButton label="Startsida" variant="outline" to="/"/>
    </template>
  </UHeader>
</template>

<script setup lang="ts"></script>

<style scoped></style>
