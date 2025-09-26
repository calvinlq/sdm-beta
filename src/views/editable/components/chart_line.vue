<template>
  <div class="item">
    <div class="flex-col">
      <div class="t">
        <div id="chart2" style="width: 100%; height: 460px"></div>
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

  //渲染折线图
  const render_line = () => {
    // 随机生成最近 30 天的日期
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().slice(0, 10);
    });

    // 随机生成示例数据 - 可以打印看数据结构
    const data = [];
    days.forEach((date) => {
      data.push({
        date,
        type: "计划待完成",
        value: Math.floor(Math.random() * 100) + 50,
      });
      data.push({
        date,
        type: "实际待完成",
        value: Math.floor(Math.random() * 100),
      });
    });

    const spec = {
      type: "line",
      data: { values: data },
      xField: "date",
      yField: "value",
      seriesField: "type",
      point: { visible: false },
      line: { style: { lineWidth: 2 } },
      legends: [
        {
          orient: "top", // 👈 改为顶部
        },
      ],
      title: {
        visible: true,
        text: "任务燃尽表",
      },
      tooltip: { visible: true },
      smooth: true,
    };

    let chart = new VChart(spec, { dom: document.getElementById("chart2") });
    chart.renderSync();
  };

  onMounted(() => {
    render_line();
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
