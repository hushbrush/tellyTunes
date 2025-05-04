<template>
    <div ref="chart" class="bar-chart-container"></div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  import * as d3 from 'd3'
  
  const props = defineProps({
    data: {     // expects an array of objects: [{ decade: 1980, Jazz: 10, Blues: 5, ... }, ...]
      type: Array,
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
  
  const chart = ref(null)
  
  function renderBar() {
    if (!props.data || props.data.length === 0) return
  
    // Clear previous
    d3.select(chart.value).selectAll('*').remove()
  
    const svg = d3.select(chart.value)
      .append('svg')
      .attr('width', props.width)
      .attr('height', props.height)
  
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const innerWidth = props.width - margin.left - margin.right
    const innerHeight = props.height - margin.top - margin.bottom
  
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
  
    // Keys are all columns except the x-axis (decade)
    const keys = Object.keys(props.data[0]).filter(k => k !== 'decade')
  
    // Stack generator
    const stack = d3.stack().keys(keys)
    const series = stack(props.data)
  
    // X scale: decades band
    const xScale = d3.scaleBand()
      .domain(props.data.map(d => d.decade))
      .range([0, innerWidth])
      .padding(0.1)
  
    // Y scale: sum of all genres per decade
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
      .nice()
      .range([innerHeight, 0])
  
    // Color scale
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeCategory10)
  
    // Draw bars
    g.selectAll('g.layer')
      .data(series)
      .join('g')
        .classed('layer', true)
        .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .join('rect')
        .attr('x', d => xScale(d.data.decade))
        .attr('y', d => yScale(d[1]))
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
  
    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d.toString()))
  
    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
  }
  
  onMounted(renderBar)
  watch(() => props.data, renderBar)
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
  