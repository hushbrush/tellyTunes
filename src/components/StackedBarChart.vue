<template>
  <div ref="chart" class="bar-chart-container"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: { type: Array, required: true },
  width: { type: Number, default: 800 },
  height:{ type: Number, default: 400 },
  highlight: {
    type: Object,
    default: () => ({ type: 'none', label: [] })
  }
})

const chart = ref(null)

function renderBar() {
  if (!props.data?.length) return
  d3.select(chart.value).selectAll('*').remove()

  const svg = d3.select(chart.value)
    .append('svg')
      .attr('width',  props.width)
      .attr('height', props.height)
  
      const tooltip = d3.select('#tooltip')
  const margin     = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = props.width  - margin.left - margin.right
  const innerHeight= props.height - margin.top  - margin.bottom

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // all genre‑keys (exclude decade)
  const keys = Object.keys(props.data[0]).filter(k => k !== 'decade')
  const series = d3.stack().keys(keys)(props.data)

  const xScale = d3.scaleBand()
    .domain(props.data.map(d => d.decade))
    .range([0, innerWidth]).padding(0.1)

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(series, s => d3.max(s, d => d[1]))]).nice()
    .range([innerHeight, 0])

  const tuneGenres = ['Rock','Blues','Country','Metal','Hiphop','Classical','Pop','Jazz','Disco','Reggae']
  const palette    = [
    '#ff5e7c', '#baf4f7', '#e8c890', '#dbdbdb', '#ffe042', 
   '#8589f2',  '#fa89f2', '#b561ed', '#b8ed68', '#f028f7',
  ]
  const genreScale = d3.scaleOrdinal().domain(tuneGenres).range(palette)

  // draw layers
  const layers = g.selectAll('g.layer')
    .data(series).join('g')
      .classed('layer', true)
      .attr('fill', d => genreScale(d.key))

  // draw rects
  const rects = layers.selectAll('rect')
    .data(d => d.map(seg => ({ key: d.key, ...seg })))
    .join('rect')
      .attr('x',      d => xScale(d.data.decade))
      .attr('y',      d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width',  xScale.bandwidth())

  // if we have a highlight step, enforce it
  if (props.highlight.type === 'bar') {
    const toHighlight = new Set(props.highlight.label)
    rects.attr('opacity', d => toHighlight.has(d.key) ? 1 : 0.2)
    // no hover behavior
  } else {
    // default all on
    rects.attr('opacity', 1)
    // wire up hover only when no highlight
    rects
      .on('mouseover', function(event, d) {
        // dim all
        rects.attr('opacity', 0.2)
        // highlight this genre
        rects.filter(r => r.key === d.key).attr('opacity', 1)
        // native tooltip: compute pct of total that decade
        const total = keys.reduce((sum,k) => sum + d.data[k], 0)
        const pct   = ((d[1]-d[0]) / total * 100).toFixed(1)
        

        tooltip
        .style('left',  event.pageX + 10 + 'px')
        .style('top',   event.pageY + 10 + 'px')
        .style('display', 'block')
        .text(d.key+': ' + d.data.decade + ' (' + pct + '%)');
      })
      .on('mouseout', function() {
        rects.attr('opacity', 1)
        tooltip.style('display', 'none');
      })
  }

  // axes
  const xAxisG = g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d => d.toString()))

  const yAxisG = g.append('g')
    .call(d3.axisLeft(yScale))

  // make axes visible
  ;[xAxisG, yAxisG].forEach(axisG => {
    axisG.selectAll('path, line').attr('stroke', 'white')
    axisG.selectAll('text').attr('fill', 'white') .style('font-size','20px').style('font-family','Jersey 25')
  })
}

onMounted(renderBar)
watch(() => [props.data, props.highlight], renderBar)
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  overflow: visible;
}
svg {
  font-family: sans-serif;
}
</style>
