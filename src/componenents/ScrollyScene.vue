<template>
    <div class="scrolly-container" v-if="loaded">
      <div class="graphic-panel">
        <component
          :is="steps[activeStepIndex].chart"
          :data="steps[activeStepIndex].data"
        />
      </div>
      <div class="steps-panel">
        <StepContent
          v-for="(step, i) in steps"
          :key="step.id"
          :id="step.id"
          :title="step.title"
          :active="activeStepIndex === i"
        />
      </div>
    </div>
    <div v-else>Loading data…</div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import scrollama from 'scrollama'
  import ClusterChart    from './ClusterChart.vue'
  import SankeyChart     from './SankeyChart.vue'
  import StackedBarChart from './StackedBarChart.vue'
  import StepContent     from './StepContent.vue'
  
  const rawData    = ref(null)
  const loaded     = ref(false)
  const activeStepIndex = ref(0)
  
  // 1) Fetch your JSON from the public folder
  onMounted(async () => {
    const resp = await fetch('/Users/harshitachakravadhanula./Desktop/sem2/DataAsMaterial/tellyTunes/tellytunes_code/public/data.json')
    rawData.value = await resp.json()
    loaded.value = true
  
    // After data is loaded, initialize scrollama
    scrollama()
      .setup({ step: '.step-content', offset: 0.5, progress: false })
      .onStepEnter(({ index }) => { activeStepIndex.value = index })
      .onStepExit(({ index, direction }) => {
        if (direction === 'up') activeStepIndex.value = index - 1
      })
  })
  
  /*
    2) Compute each chart’s input from rawData.
       Use computed() so they update as soon as rawData arrives.
  */
  const clusterData = computed(() => {
    if (!rawData.value) return null
    return transformToCluster(rawData.value)
  })
  const sankeyData = computed(() => {
    if (!rawData.value) return null
    return transformToSankey(rawData.value)
  })
  const barData = computed(() => {
    if (!rawData.value) return null
    return transformToBar(rawData.value)
  })
  
  /*
    3) Build your steps array—now each step picks up the computed data
  */
  const steps = [
    { id: 'intro',   title: 'Intro',     chart: null,               data: null        },
    { id: 'cluster', title: 'Cluster',   chart: ClusterChart,       data: clusterData },
    { id: 'sankey',  title: 'Sankey',    chart: SankeyChart,        data: sankeyData  },
    { id: 'decade',  title: 'By Decade', chart: StackedBarChart,    data: barData     },
  ]
  
  // 4) Placeholder transforms—replace these with your real roll‑ups
  function transformToCluster(data) {
    // e.g. cluster by ML label confidence…
    return { nodes: [], links: [] }
  }
  function transformToSankey(data) {
    // e.g. link show_genre → tune_genre counts…
    return { nodes: [], links: [] }
  }
  function transformToBar(data) {
    // e.g. count tunes per decade…
    return []
  }
  </script>
  