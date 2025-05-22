<template>
    <div id="app">
      <div id="tooltip" class="tooltip" style="display: none;"></div>
      <!-- The ScrollyScene component handles the scrolling steps and chart swapping -->
      <ScrollyScene />
    </div>
  </template>
  
  <script setup>
  // Import the main scrollytelling scene
  import ScrollyScene from './components/ScrollyScene.vue'
  </script>
  
  <style>
  /* Global styles or Tailwind imports can go here */
  html{
    background-color: #121212;
    color: #121212;
  }
  #app {
    font-family: "Jersey 25", sans-serif;
    margin: 0;
    padding: 0;
    color: #ccc
  }
.scrolly-container {
  display: flex;
}
.graphic-panel {
  position: sticky;
  top: 0;
  flex: 1;
  min-height: 100vh;
  background: white;
}
.steps-panel {
  flex: 1;
  padding: 2rem;
}
.step-content {
  margin-bottom: 200px; /* so you have room to scroll */

}
.tooltip{
  position: absolute;
  background: #fff;
  padding: 5px;
  border-radius: 5px;
  pointer-events: none;
  color: #000;
  font-family: "Jersey 25", sans-serif;
  font-size: 30px;
  z-index: 5;

}
  
  </style>
  