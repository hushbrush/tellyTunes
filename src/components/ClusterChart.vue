<template>
  <div ref="chartContainer" class="cluster-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data:      { type: Object, required: true },
  width:     { type: Number, default: 700 },
  height:    { type: Number, default: 700 },
  highlight: { type: Object, default: () => ({ type: 'none' }) }
})

const chartContainer = ref(null)

// glob all your wavs into an object: { 'A Pup...Ending.wav': '/_assets/...hash.wav', ... }
// const wavMap = import.meta.glob('../tellyTunes/wavs/*.wav', { as: 'url', eager: true })

function renderCluster() {
  const raw = props.data?.nodes || []
  if (!raw.length) return

  d3.select(chartContainer.value).selectAll('*').remove()

  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', props.width)
    .attr('height', props.height)

  const clusters = Array.from(new Set(raw.map(d => d.label)))
 const color = [
    '#ff5e7c', '#baf4f7', '#e8c890', '#dbdbdb', '#ffe042', 
   '#8589f2',  '#fa89f2', '#b561ed', '#b8ed68', '#f028f7',
  ]
  const r = 7


  const tooltip = d3.select('#tooltip')
  // prepare nodes
  const nodes = raw.map(d => ({ ...d }))

  // draw circles + native tooltip + audio on hover
  const vm = { } // dummy for closure
  const nodeElems = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
      .attr('r', r)
      .attr('fill', d =>( d.label === 'none' ? '#fff' : color[clusters.indexOf(d.label)]))
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('opacity', d => {
        if (props.highlight.type !== 'cluster') return 1;

        // if the highlight label matches the show‑genre → use that
        if (d.show_genre === props.highlight.label) return 1;

        // otherwise if it matches the audio‑genre (main_label) → use that
        if (d.label === props.highlight.label) return 1;

        // everything else fades
        return 0.1;
      })

    // …your svg.append('g').selectAll('circle').data(nodes).join('circle')…
      .on('mouseover', function(event, d) {
        // `this` is the <circle> element
        
        nodeElems.attr('opacity', n => n === d ? 1 : 0.4);
        tooltip
          .style('left',  event.pageX + 10 + 'px')
          .style('top',   event.pageY + 10 + 'px')
          .style('display', 'block')
          .text(d.name)
        

        if (d.name) {
          const url = `https://zedgzkowwfwyohtdpstx.supabase.co/storage/v1/object/public/wavs/${encodeURIComponent(d.name)}.wav`

          const audio = new Audio(url)
          audio.play().catch(err => console.warn('audio play failed', err))
          // store on the element
          this._hoverAudio = audio
        }
      })
      .on('mouseout', function(event, d) {
        

        nodeElems.attr('opacity', n => {
      if (props.highlight.type !== 'cluster') return 1;
      if (n.show_genre === props.highlight.label) return 1;
      if (n.label      === props.highlight.label) return 1;
      return 0.1;
        })
        tooltip.style('display', 'none')
        // stop & reset the same audio instance
        if (this._hoverAudio) {
          this._hoverAudio.pause()
          this._hoverAudio.currentTime = 0
          delete this._hoverAudio
        }
      })


  // how many clusters per row
  const perRow = Math.ceil(clusters.length / 2)

  // your desired space between cluster‐groups
  const gutter = 100        // ← shrink this to bring them closer
  // compute the width left over after gutters
  const usableWidth = props.width - gutter * (perRow - 1)
  // the width allocated to each cluster‐group
  const groupWidth  = usableWidth / perRow

   // create a single <g> that shifts everything right by xOffset


  const clusterCenters = clusters.map((label, i) => {
    const row = i < perRow ? 0 : 1
    const idx = i % perRow

    // x = left margin + index × (groupWidth + gutter) + half a groupWidth
    const x = idx * (groupWidth + gutter) + groupWidth / 2

    // y unchanged (you already split into two rows)
    const y = (props.height / 2) * (row === 0 ? 0.5 : 1.5)

    return { label, x, y }
  })


  // draw cluster labels
  svg.append('g')
    .selectAll('text')
    .data(clusterCenters)
    .join('text')
      .attr('x', d => d.x+10)
      .attr('y', d => d.y - r*4-130)
      .attr('text-anchor', 'middle')
      .attr('fill',  d =>( d.label === 'none' ? '#fff' : color[clusters.indexOf(d.label)]))
      .attr('font-size', '48px')
      .text(d => d.label.charAt(0).toUpperCase() + d.label.slice(1))
      

  // force simulation using per‑node centers
  d3.forceSimulation(nodes)
    .force('x', d3.forceX(d => {
      const c = clusterCenters.find(c=>c.label===d.label)
      return c ? c.x : props.width/2
    }).strength(0.2))
    .force('y', d3.forceY(d => {
      const c = clusterCenters.find(c=>c.label===d.label)
      return c ? c.y : props.height/2
    }).strength(0.2))
    .force('collide', d3.forceCollide(r+1))
    .force('charge', d3.forceManyBody().strength(-10))
    .on('tick', () => {
      svg.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    })
}

onMounted(renderCluster)
watch(() => props.highlight, renderCluster)
</script>

<style scoped>
.cluster-chart {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  /* center the svg inside this div */
  display: block;       /* so margin auto works */
  margin: 0 auto;
}
/* target your inner <g> */
.cluster-chart svg > g {
  transform-box: fill-box;       /* use the group's own box as the reference */
  transform-origin: center;      /* center of that box */
  transform: translateX(50%);    /* shift it right by half its width */
}

</style>

