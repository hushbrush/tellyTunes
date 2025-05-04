<<template>
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
  opacity: 0.3;
  transition: opacity .3s;
}
.step-content[active] h2 {
  opacity: 1;
}
</style>
