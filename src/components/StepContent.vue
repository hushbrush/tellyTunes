<template>
  <div class="step-content" :class="{ active }">
    <h2>{{ title }}</h2>
    <p v-if="content">{{ content }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  title: String,
  content: String,
  active: Boolean
})
</script>

<style>
.step-content {
  margin-bottom: 200px;  /* give space for scrolling */
}
.step-content h2 {
  opacity: 1;
}

.p{
  .jersey-25-regular {
  font-family: "Jersey 25", sans-serif;
  font-weight: 400;
  font-style: normal;
}

}
</style>
