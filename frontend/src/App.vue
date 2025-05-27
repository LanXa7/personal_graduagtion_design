<script setup lang="ts">
import {useDark, useToggle} from '@vueuse/core'
import { onMounted } from 'vue';
import * as tf from '@tensorflow/tfjs';

useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light'
})

useDark({
  onChanged(dark) {
    useToggle(dark)
  }
})

// 初始化TensorFlow.js
onMounted(async () => {
  try {
    // 启用WebGL后端
    await tf.setBackend('webgl');
    console.log('TensorFlow.js已初始化，使用后端:', tf.getBackend());
  } catch (error) {
    console.error('TensorFlow.js初始化失败:', error);
  }
});

</script>

<template>
  <header>
    <div class="wrapper">
      <router-view/>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}
</style>
