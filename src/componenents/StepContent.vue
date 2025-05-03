<template>
    <div
      :id="id"
      class="step-content py-12"
      :class="{ 'opacity-100': active, 'opacity-50': !active }"
    >
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <slot />  <!-- you can pass in your call-out text here -->
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  defineProps({
    id:     String,
    title:  String,
    active: Boolean,
  })
  </script>
  