<template>
  <div class="item" v-if="element && element.title">
    <div class="n-t flexs">
      <h4>{{ element.title }}</h4>
      <div
        class="n-icon flexc"
        :style="{
          background: element.bg + '1a',
          color: element.bg,
        }"
      >
        <component :is="iconMap[element.icon]" />
      </div>
    </div>
    <h1>{{ element.num }}</h1>
    <div class="flex n-d">
      <p>{{ element.progress }}</p>
      <p>{{ element.desc }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    nextTick,
    getCurrentInstance,
  } from "vue";
  import {
    Checked,
    TrendCharts,
    List,
    Flag,
    Document,
    Timer,
    User,
  } from "@element-plus/icons-vue";
  //图标
  const iconMap = {
    Checked,
    TrendCharts,
    List,
    Flag,
  };

  const props = defineProps({
    element: {
      type: Object,
      default: () => {},
    },
  });
  console.log("props", props);
  const emit = defineEmits([""]);
</script>

<style scoped>
  .n-t {
    height: 50px;
  }
  .n-icon {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    overflow: hidden;
  }
  .n-icon svg {
    width: 20px;
    height: 20px;
  }
  * {
    padding: 0;
    margin: 0;
  }
  .n-d {
    height: 35px;
    border-top: 1px solid #f1f1f1;
    font-size: 12px;
  }
  .n-d p {
    margin-right: 10px;
  }

  .n-i h1 {
    line-height: 1.6;
  }
  .item {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0 15px;
  }
  .item h1 {
    margin: 0;
  }
</style>
