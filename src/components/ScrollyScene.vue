<!-- ScrollyScene.vue -->
<template>
  <div class="intro-block">
    <!-- 🟢 Leave this block untouched -->
    <h1>The TellyTune Chronicles</h1>
    <h3>Mapping Genre Patterns and Trends in Television Themes</h3>
    <p class="introduction">
      There’s something quietly magical about a TV theme: a ten-second jingle can transport you back to Saturday morning cartoons or late-night dramas. I’ve always been drawn to their odd textures—the tinny bleeps, the over-enthusiastic brass stabs, even the cringe-inducing synths of an ’80s sitcom. They feel at once chill and absurd, tiny time capsules of a show’s promise and era. It’s almost funny to think what the shows want to be perceived as, especially after the era has passed and the audience has already passed the judgement on what the show actually was.<br />
     
    </p>
  </div>

  <!-- 🔵 Background graphic layer -->
  <div class="graphic-bg">
    <component
  :is="steps[activeStepIndex].chart"
  v-if="steps[activeStepIndex].chart && steps[activeStepIndex].data?.value"
  :data="steps[activeStepIndex].data.value"
  :width="width"
  :height="height"
  :highlight="steps[activeStepIndex].highlight"
/>
  </div>

  <!-- 🔴 Foreground scroll/text layer -->
  <div class="scrolly-container" v-if="loaded">
    <!-- Replace your steps-panel div -->
<div class="steps-panel">
  <StepContent
  v-for="(step, i) in steps"
  :key="step.id"
  :id="step.id"
  :title="step.title"
  :content="step.content"
  :active="activeStepIndex === i"
/>

</div>

  </div>
  <div v-else>Loading data…</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { nextTick } from 'vue'
import scrollama from 'scrollama'
import ClusterChart from './ClusterChart.vue'
import SankeyChart from './SankeyChart.vue'
import StackedBarChart from './StackedBarChart.vue'
import StepContent from './StepContent.vue'

const rawData = ref(null)
const loaded = ref(false)
const activeStepIndex = ref(0)

const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

window.addEventListener('resize', () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
})


onMounted(async () => {
  const resp = await fetch(import.meta.env.BASE_URL + 'data.json')

  rawData.value = await resp.json()
  loaded.value = true

  await nextTick()
  scrollama()
    .setup({ step: '.step-content', offset: 0.5 })
    .onStepEnter(({ index }) => activeStepIndex.value = index)
    .onStepExit(({ index, direction }) => {
      if (direction === 'up') activeStepIndex.value = index - 1
    })
})

const datasetStats = computed(() => {
  if (!rawData.value) return {
    total: 0, minYear: 'N/A', maxYear: 'N/A', topGenre: 'N/A'
  }
  const data = rawData.value
  const years = data.map(d => d.year).filter(Boolean)
  const genres = data.map(d => d.main_label).filter(Boolean)
  const genreCounts = genres.reduce((acc, g) => {
    acc[g] = (acc[g] || 0) + 1
    return acc
  }, {})
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  return {
    total: data.length,
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    topGenre
  }
})

const clusterData = computed(() => rawData.value ? transformToCluster(rawData.value) : null)
const sankeyData = computed(() => rawData.value ? transformToSankey(rawData.value) : null)
const barData = computed(() => rawData.value ? transformToBar(rawData.value) : null)

const steps = [
  //  This project explores <strong>{{ datasetStats.total }}</strong> different jingles...
  {
  id: 'intro',
  title: '',
  chart: null,
  data: null,
  highlight: { type: 'none' },
  content: `Lets explore how different genres shaped the soundscape of television. Dive into the clusters, trends, and absurdity of TV past. 

  There are 1133 different jingles in this dataset, spanning from 1950 to 2025. `
},
{
  id: 'cluster',
  title: '',
  chart: ClusterChart,
  data: clusterData,
  // highlight: { type: 'cluster', label: NaN },
  content: `Let's look at the genres. You can hover over the circles to hear the tunes.`
},
  
{
  id: 'cluster2',
  title: '',
  chart: ClusterChart,
  data: clusterData,
  highlight: { type: 'cluster', label: 'Cartoon' },
  content: `Now, let's look at the Cartoons. `
},
{
  id: 'cluster3',
  title: '',
  chart: ClusterChart,
  data: clusterData,
  highlight: { type: 'cluster', label: 'Sports' },
  content: `Notice how that's a wee bit different in distribution from Sports?`
},
{
  id: 'cluster4',
  title: '',
  chart: ClusterChart,
  data: clusterData,
  
  highlight: { type: 'cluster', label: 'Legal Drama' },
  content: `Or, say, Legal Dramas?`
},
{
  id: 'Sankey',
  title: '',
  chart: SankeyChart,
  data: sankeyData,
  content: `Let's Explore this in a bit more detail. Here is the flow from Tune Genres to Television Show Genres. You can interact with the bars to see the different flows.`
},
{
  id: 'Sankey1',
  title: '',
  chart: SankeyChart,
  data: sankeyData,
  highlight: { type: 'sankey', label: ['Classical'] },
  content: `Clearly, Classical is, well, classic.`
},
{
  id: 'Sankey2',
  title: '',
  chart: SankeyChart,
  data: sankeyData,
  highlight: { type: 'sankey', label: ['Jazz'] },
  content: `A large chunk of Jazz goes into Game Shows`
},
{
  id: 'Sankey25',
  title: '',
  chart: SankeyChart,
  data: sankeyData,
  highlight: { type: 'sankey', label: ['Metal'] },
  content: `And a large chunk of Metal goes into Sports`
},
{
  id: 'Sankey3',
  title: '',
  chart: SankeyChart,
  data: sankeyData,
  highlight: { type: 'sankey', label: ['Disco', 'Reggae', 'Hiphop'] },
  content: `Disco, Reggae and Hiphop have nearly identical flows`
},

{
  id: 'decade1',
  title: '',
  chart: StackedBarChart,
  data: barData,
  highlight: { type: 'none' },
  content: `But wait, it's not just about the TV Show Genre. Here's a look into the decade-wise distribution of the genres.`
},
{
  id: 'decade5',
  title: '',
  chart: StackedBarChart,
  data: barData,
  highlight: { type: 'bar', label: ['Classical'] },
  content: `Classical is not as classic in time.`},
  {
  id: 'decade3',
  title: '',
  chart: StackedBarChart,
  data: barData,
  highlight: { type: 'bar', label: ['Rock', 'Blues'] },
  content: `Rock and Blues overtook Classical in the 90s`
},
{
  id: 'decade2',
  title: '',
  chart: StackedBarChart,
  data: barData,
  highlight: { type: 'bar', label: ['Disco'] },
  content: `Disco had a bit of a decade-delayed moment in the 80s.`
},

{
  id: 'decade4',
  title: '',
  chart: StackedBarChart,
  data: barData,
  highlight: { type: 'bar', label: ['Jazz'] },
  content: `And Jazz seems to be regaining popularity today`
},

{
  id: 'Outro',
  title: '',
  chart: null,
  data: null,
  highlight: { type: 'none' },
  content: `That's all, folks. See you next time!`
},
]

function transformToCluster(data) {
  const nodes = data.map((d, i) => ({
    id: i,
    label: d.main_label || 'Unknown',
    show_genre: d.show_genre || 'Unknown',
    confidence: +d.top_1_confidence || 1,
    name: d.identifier || 'Unknown'
  }))
  return { nodes, links: [] }
}

function transformToSankey(data) {
  const counts = {}
  const nodeSet = new Set()
  data.forEach(d => {
    const s = d.main_label || 'Unknown'
    const t = d.show_genre || 'Unknown'
    counts[`${s}→${t}`] = (counts[`${s}→${t}`] || 0) + 1
    nodeSet.add(s); nodeSet.add(t)
  })
  const nodeList = [...nodeSet]
  const nodes = nodeList.map(name => ({ name }))
  const links = Object.entries(counts).map(([k, v]) => {
    const [source, target] = k.split('→')
    return { source: nodeList.indexOf(source), target: nodeList.indexOf(target), value: v }
  })
  return { nodes, links }
}

function transformToBar(data) {
  const grouped = {}
  data.forEach(d => {
    const decade = d.year ? Math.floor(d.year / 10) * 10 : 'Unknown'
    const genre = d.main_label || 'Unknown'
    grouped[decade] = grouped[decade] || {}
    grouped[decade][genre] = (grouped[decade][genre] || 0) + 1
  })
  return Object.entries(grouped).map(([decade, counts]) => ({ decade, ...counts }))
}
</script>

  <style scoped>
  body{
    background: #2b2b2b;
    color: #2b2b2b;
  }
.intro-block {
  /* background: url('/tv-crt.jpg') center center / cover no-repeat; */
  /* filter: contrast(1.1) brightness(1.1) saturate(1.1); */
  border-radius: 70px;
  box-shadow: inset 0 0 80px rgba(55, 80, 65, 0.1);
  transform: scale(1.01) perspective(800px) rotateX(1deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 80vh;
  color: #2b2b2b;
  margin: 80px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(#386369, #2b3a40);
  font-family: "amboy-inline", sans-serif;
 
  /* font-family: 'Bungee', sans-serif; */

  
/* font-weight: 400;
font-style: normal; */
}



.intro-block::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 2px,
    transparent 2px,
    transparent 4px
  );
  z-index: 2;
  pointer-events: none;
}


.intro-block h1 {
  color: #c2ffd2;
  font-size: 4rem;
  margin: 0;
  text-shadow: 2px 2px 0 #ffffff5f;
  z-index: 2;
  font-family: "amboy-inline", sans-serif;

}

.intro-block h3 {
  animation: flicker 1.2s infinite;
  font-size: 1.5rem;
  color: #ccc;
  font-weight: normal;
  margin-top: 1rem;
  z-index: 2;
}

  .introduction{
    width: 45%;
    color: #ccc;
    font-family:'jersey-25-regular', sans-serif;
    font-size: large;
  }


@keyframes float {
  0% { transform: translate(-50%, 0); }
  100% { transform: translate(-50%, 10px); }
}
.intro-block::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
  z-index: 2;
}
@keyframes flicker {
  0%   { opacity: 1; }
  48%  { opacity: 0.98; }
  50%  { opacity: 1; }
  52%  { opacity: 0.97; }
  100% { opacity: 1; }
}

.graphic-bg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.scrolly-container {
  position: relative;
  z-index: 2;
  padding: 10vh 5vw;
  pointer-events: none;
}
.steps-panel {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  max-width: 40rem;
  margin: auto;
}

.step-content {
  width: 40%;
  margin: 0 auto;
  color: #000;
  margin-bottom: 100vh;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-family:'jersey-25-regular', sans-serif;
  transition: transform 0.3s ease;
  font-size: 1.2rem;
  text-align: center;
  pointer-events: auto;
}


  </style>