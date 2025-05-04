<template>
  <div ref="container" class="sankey-chart"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 400
  }
})

const container = ref(null)

function renderSankey() {
  if (
    !props.data ||
    !Array.isArray(props.data.nodes) ||
    !Array.isArray(props.data.links)
  ) {
    console.warn('SankeyChart: Invalid or incomplete data')
    return
  }

  const { nodes, links } = props.data

  if (nodes.length === 0 || links.length === 0) {
    d3.select(container.value).selectAll('svg').remove()
    return
  }

  const svg = d3
    .select(container.value)
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('width', props.width)
    .attr('height', props.height)

  const { nodes: uNodes, links: uLinks } = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [props.width - 1, props.height - 6]])({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  })

  svg.selectAll('*').remove() // Clear any old junk

  svg.append('g')
    .selectAll('path')
    .data(uLinks)
    .join('path')
    .attr('d', sankeyLinkHorizontal())
    .attr('stroke-width', d => Math.max(1, d.width))
    .attr('fill', 'none')
    .attr('stroke', '#888')
    .style('mix-blend-mode', 'multiply')

  svg.append('g')
    .selectAll('rect')
    .data(uNodes)
    .join('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('height', d => d.y1 - d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('fill', '#4287f5')
    .append('title')
    .text(d => `${d.name}\n${d.value}`)

  svg.append('g')
    .selectAll('text')
    .data(uNodes)
    .join('text')
    .attr('x', d => (d.x0 < props.width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr('y', d => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => (d.x0 < props.width / 2 ? 'start' : 'end'))
    .text(d => d.name)
    .style('font-size', '12px')
}

onMounted(renderSankey)
watch(() => props.data, renderSankey)
</script>
