<template>
  <div ref="chartContainer" class="cluster-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: { type: Object, required: true },
  width: { type: Number, default: 800 },
  height: { type: Number, default: 400 },
  highlight: { type: Object, default: () => ({ type: 'none' }) }
})


const chartContainer = ref(null)

function renderCluster() {
  const raw = props.data?.nodes || []
  if (!raw.length) return

  d3.select(chartContainer.value).selectAll('*').remove()

  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', props.width)
    .attr('height', props.height)
    .style('margin', '60px') // Margin to keep the blobs from edge-hugging

  const clusters = Array.from(new Set(raw.map(d => d.label)))
  const color = d3.scaleOrdinal().domain(clusters).range(d3.schemeCategory10)
  const r = 7

  const nodes = raw.map(d => ({ ...d })) // ← THIS must come first

  const nodeElems = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', r)
    .attr('fill', d => color(d.label))
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('opacity', d => {
        if (props.highlight.type === 'cluster') {
          return d.label === props.highlight.label ? 1 : 0.1
        }
        return 1
      })


  const clusterCenters = clusters.map((c, i) => ({
    label: c,
    x: (props.width / clusters.length) * i + (props.width / clusters.length) / 2,
    y: props.height / 2
  }))

  svg.append('g')
    .selectAll('text')
    .data(clusterCenters)
    .join('text')
    .attr('x', d => d.x)
    .attr('y', d => d.y - 100)
    .attr('text-anchor', 'middle')
    .attr('fill', '#fff')
    .attr('font-size', '16px')
    .attr('font-family', 'sans-serif')
    .text(d => d.label)

  d3.forceSimulation(nodes) // ← Now it's okay to use `nodes`
    .force('x', d3.forceX(d => {
      const center = clusterCenters.find(c => c.label === d.label)
      return center?.x || props.width / 2
    }).strength(0.2))
    .force('y', d3.forceY(props.height / 2).strength(0.2))
    .force('collide', d3.forceCollide(r + 2))
    .force('charge', d3.forceManyBody().strength(-10))
    .on('tick', () => {
      nodeElems.attr('cx', d => d.x).attr('cy', d => d.y)
    })
}


onMounted(renderCluster)
watch(() => props.highlight, () => {
  renderCluster() // or whatever your rendering function is
})

</script>

<style scoped>
.cluster-chart {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
svg {
  font-family: sans-serif;
}
</style>
