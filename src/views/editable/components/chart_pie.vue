<template>
  <div class="item">
    <div class="fle x -col">
      <h4 class="i-t flexs">重新新开一个项目</h4>
      <div class="flexs" style="padding: 20px">
        <div>
          <div class="flex i-i-d">
            <div class="flex">
              <Timer />
              项目进度
            </div>
            <p>0%</p>
          </div>
          <div class="flex i-i-d">
            <div class="flex"><User />项目成员</div>
            <p>1</p>
          </div>
          <div class="flex i-i-d">
            <div class="flex"><Document />项目任务总数</div>
            <p>2</p>
          </div>
        </div>
        <div class="t" style="border-left: 1px solid #f1f1f1">
          <div id="chart1" style="width: 600px; height: 200px"></div>
        </div>
      </div>
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
  import VChart from "@visactor/vchart";

  const props = defineProps({
    data: {
      type: Object,
      default: () => {},
    },
  });
  const emit = defineEmits([""]);

  //渲染饼图
  const render_pie = () => {
    const data = [
      { type: "未开始", value: 30 },
      { type: "已开始", value: 70 },
    ];
    const option = {
      type: "pie",
      data: { values: data },
      outerRadius: 0.8,
      innerRadius: 0.5, // 设置内半径 -> 环形
      categoryField: "type",
      valueField: "value",
      legends: {
        visible: true,
        orient: "right",
      },
      labels: {
        visible: true,
        formatter: (d) => `${d.type}: ${d.value}`,
      },
      tooltip: {
        visible: true,
      },
      label: {
        visible: true,
      },
    };
    let chart = new VChart(option, { dom: document.getElementById("chart1") });
    chart.renderSync();
  };

  onMounted(() => {
    render_pie();
  });
</script>

<style scoped>
  .flex-col {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .i-i-d {
    font-weight: bold;
    padding: 10px 0;
    font-size: 14px;
  }
  .i-i-d svg {
    width: 15px;
    height: 15px;
    margin-right: 5px;
  }
  .i-i-d p {
    margin-left: 20px;
  }
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
</style>
