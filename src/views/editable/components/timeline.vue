<template>
  <div class="item" v-if="data">
    <h4 class="i-t flexs">项目动态</h4>
    <!--时间线 -->
    <div class="timeline">
      <div class="t-i flex" v-for="d in data">
        <div class="t-avatar">
          <img :src="d.avatar" alt="" />
        </div>
        <div class="t-c">
          <div class="flexs">
            <div class="t-name">{{ d.name }}</div>
            <div class="t-time">{{ d.time }}</div>
          </div>
          <div class="t-task">{{ d.task }}</div>
          <div class="t-task-desc">{{ d.task_desc }}</div>
        </div>
      </div>
    </div>

    <!--时间线end -->
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

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
  });
  const emit = defineEmits([""]);
</script>

<style scoped>
  .i-t {
    padding: 0 15px 15px 15px;
    border-bottom: 1px solid #f1f1f1;
  }
  .item {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    overflow: hidden;
  }
  .t-task {
    color: #999;
    margin: 5px 0;
  }
  .t-task-desc {
    font-weight: 600;
    color: #333;
  }
  .t-time {
    font-size: 14px;
    color: #999;
  }
  .t-name {
    font-size: 15px;
    font-weight: bold;
    margin: 5px 0;
  }
  .timeline {
    position: relative;
    padding: 20px;
  }
  .t-i {
    font-size: 14px;
    padding: 10px 0;
    padding-left: 30px;
    position: relative;
    align-items: flex-start !important;
  }
  .t-i:before {
    content: "";
    position: absolute;
    z-index: 2;
    left: 0;
    top: 25px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #1d69e5;
  }
  .t-i:after {
    content: "";
    position: absolute;
    z-index: 1;
    left: 2.5px;
    top: 31px;
    width: 2px;
    height: 100%;
    background-color: #f1f1f1;
  }
  .timeline .t-i:last-child:after {
    height: 0px;
  }
  .t-c {
    width: 90%;
  }
  .t-avatar {
    width: 60px;
  }
  .t-avatar img {
    width: 40px;
    height: 40px;
    background-color: #f1f1f1;
    border-radius: 50%;
    object-fit: cover;
  }
</style>
