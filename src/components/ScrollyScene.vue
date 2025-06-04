<!-- ScrollyScene.vue -->
<template>
 <div class="intro-block">
  <div class="intro-content">
    <h3>Explore the television tunes by their genre and usage</h3>
      <button
    class="unmute-button"
    @click="toggleMute"
  >
    <!-- switch label based on state -->
    {{ isMuted ? '🔇 Mute' : '🔈 Click to Unmute 🔊' }}
  </button>
  </div>
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
    <div class="extro" v-if="activeStepIndex === steps.length - 1"><h2>Thanks for scrolling!</h2></div>
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

const isMuted = ref(false)
function toggleMute() {
  isMuted.value = !isMuted.value
  console.log('mute toggled:', isMuted.value) 
}

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
  if (direction === 'down' && index === steps.length - 1) {
    activeStepIndex.value = steps.length // ✅ trigger extro
  } else if (direction === 'up') {
    activeStepIndex.value = index - 1
  }
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
  content: `Let's look at the genres. You can hover over the boxes to hear the tunes.`
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
  background-image: url('public/intro_bg.png');

  background-repeat: no-repeat;
  background-position: 50% 36%;
  width: 1400px;
  height: 800px;
  border-radius: 100px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 70px;
  position: relative;
  overflow: hidden;

  font-family:'Jersey 25', sans-serif;
}
.intro-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60vh;
}




  .introduction{
    width: 45%;
    color: #000000;
    font-family:'Jersey 25', sans-serif;
    font-size: large;
  }


@keyframes float {
  0% { transform: translate(-50%, 0); }
  100% { transform: translate(-50%, 10px); }
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
  width: 70%;
  margin: 0 auto;
  color: #000;
  margin-bottom: 100vh;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-family:'Jersey 25', sans-serif;
  letter-spacing: 0.8px;
  line-height: 30px;
  transition: transform 0.3s ease;
  font-size: 1.8rem;
  text-align: center;
  pointer-events: auto;
}
.extro{
  background-image: url('public/extro.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;


  width: 120vh;
  height:  90vh;
  border-radius: 10%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 70px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}


h3{
  font-family:'Jersey 25', sans-serif;
  font-size: 40px;
  color: #a0a0a0;
  text-align: center; 
  letter-spacing: 0.7px;
  
}

/* .unmute-button {

  padding: 10px 20px;
  font-size: 22px;
  font-family: 'Jersey 25', sans-serif;
  background-color: #fff;
  color: #f028f7;
  border-radius: 8px;
  border-width: 3 px;
  border-color: #ffe042;
  cursor: pointer;

  transition: transform 0.2s ease, box-shadow 0.2s ease;

} */


.unmute-button {
  /* bigger hit-area */
  padding: 16px 32px;
  font-size: 1.6rem;
  font-family: 'Jersey 25', sans-serif;

  /* solid border in one shorthand call */
  border: 3px solid #ffe042;
  border-radius: 8px;

  background-color: #fff;
  color: #f028f7;
  cursor: pointer;

  /* smooth transforms and shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.unmute-button:hover {
  transform: scale(1.05);
  box-shadow:
    0 0 8px rgba(255, 224, 66, 0.7),
    0 0 16px rgba(255, 224, 66, 0.5);
}



  </style>