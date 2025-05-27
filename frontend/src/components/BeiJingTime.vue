<template>
  <span>{{ formattedTime }}</span>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { formatBeiJingTime, formatChineseTime } from '@/utils/dateUtils';

const props = defineProps({
  // 时间值，可以是日期对象、时间戳或日期字符串
  time: {
    type: [Date, Number, String],
    required: true
  },
  // 格式化模式
  format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss'
  },
  // 是否使用中文格式（年月日）
  chinese: {
    type: Boolean,
    default: false
  }
});

// 计算格式化后的时间
const formattedTime = computed(() => {
  if (!props.time) return '';
  
  return props.chinese
    ? formatChineseTime(props.time)
    : formatBeiJingTime(props.time, props.format);
});
</script> 