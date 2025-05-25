<template>
  <div ref="container" class="sankey-chart"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'

// add highlight prop
const props = defineProps({
  data:      { type: Object, required: true },
  width:     { type: Number, default: 800 },
  height:    { type: Number, default: 400 },
  highlight: { type: Object, default: () => ({ type: 'none' }) }
})

const container = ref(null)

function renderSankey() {
  if (!props.data || !Array.isArray(props.data.nodes) || !Array.isArray(props.data.links)) {
    console.warn('SankeyChart: Invalid data')
    return
  }
  const { nodes, links } = props.data
  if (nodes.length === 0 || links.length === 0) {
    d3.select(container.value).selectAll('svg').remove()
    return
  }

  // clear & create svg
  const svg = d3.select(container.value)
    .selectAll('svg').data([null]).join('svg')
      .attr('width',  props.width)
      .attr('height', props.height)
  svg.selectAll('*').remove()

  // build the sankey
  const sankeyGenerator = sankey()
    .nodeWidth(35)
    .nodePadding(10)
    .extent([[1,1],[props.width-1, props.height-6]])
    .nodeSort((a,b) => a.x0 === b.x0 ? b.value - a.value : a.x0 - b.x0)

  const { nodes: uNodes, links: uLinks } = sankeyGenerator({
    nodes: nodes.map(d=>({ ...d })),
    links: links.map(d=>({ ...d }))
  })

  // colour scale for tune‑genres
  const tuneGenres = ['Rock','Blues','Country','Metal','Hiphop','Classical','Pop','Jazz','Disco','Reggae']
  const color = [
    '#ff5e7c', '#baf4f7', '#e8c890', '#dbdbdb', '#ffe042', 
   '#8589f2',  '#fa89f2', '#b561ed', '#b8ed68', '#f028f7',
  ]
  const genreScale = d3.scaleOrdinal().domain(tuneGenres).range(color)

  // draw links
  const linkPaths = svg.append('g')
    .selectAll('path')
    .data(uLinks)
    .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill','none')
      .attr('stroke', d => genreScale(d.source.name))
      .attr('stroke-width', d => Math.max(1,d.width))
      .attr('stroke-opacity', props.highlight.type==='sankey'
        ? d => ( props.highlight.label.includes(d.source.name) ? 0.8 : 0.1)
        : 0.2
      )

  // identify which are “show‐genre” nodes
  const showSet = new Set(uLinks.map(l=>l.target.name))

  // draw nodes
  const nodeRects = svg.append('g')
    .selectAll('rect')
    .data(uNodes)
    .join('rect')
      .attr('x', d=>d.x0).attr('y', d=>d.y0)
      .attr('width', d=>d.x1-d.x0).attr('height', d=>d.y1-d.y0)
      .attr('fill', d => showSet.has(d.name) ? 'white' : genreScale(d.name))
      .attr('opacity', props.highlight.type==='sankey'
        ? d => (props.highlight.label.includes(d.name) ? 1 : 0.4)
        : 1
      )
      

  // titles
  nodeRects.append('title').text(d=>`${d.name}\n${d.value}`)

  // labels
  svg.append('g')
    .selectAll('text')
    .data(uNodes)
    .join('text')
      .attr('x', d=> d.x0 < props.width/2 ? d.x1+6 : d.x0-6)
      .attr('y', d=> (d.y0+d.y1)/2)
      .attr('dy','0.35em')
      .attr('text-anchor', d=> d.x0 < props.width/2 ? 'start' : 'end')
      .text(d=>d.name)
      .attr('fill', d=> showSet.has(d.name) ? 'white' : genreScale(d.name))
      .style('filter', 'drop-shadow(0px 0px 10px #000)')
      .style('font-size','40px')

    // … after creating linkPaths and nodeRects …

  // shared reset function
  function resetAll() {
    nodeRects.attr('opacity', 1)
    linkPaths.attr('stroke-opacity', 0.2)
  }

  // if we are in a “highlight” step, just enforce that styling
   if (props.highlight.type === 'sankey') {
   // normalize label to array
   const labels = Array.isArray(props.highlight.label)
     ? props.highlight.label
     : [props.highlight.label]
+
   nodeRects.attr('opacity', d =>
     labels.includes(d.name) ? 1 : 0.4
   )
   linkPaths.attr('stroke-opacity', l =>
     labels.includes(l.source.name) ? 0.8 : 0.1
   )
 } else {
    // otherwise hook up hover interactivity
    nodeRects
      .on('mouseover', (event, d) => {
        nodeRects.attr('opacity', n => n === d ? 1 : 0.4)
        linkPaths.attr('stroke-opacity', l =>
          l.source === d || l.target === d ? 0.8 : 0.1
        )
      })
      .on('mouseout', () => {
        resetAll()
      })
    // make sure everything starts “unfaded”
    resetAll()
  }

}

onMounted(renderSankey)
watch(() => [props.data, props.highlight], renderSankey)
</script>

<style scoped>
.sankey-chart {
  width: 100%;
  height: 100%;
  transform: scale(0.9);
}
</style>
