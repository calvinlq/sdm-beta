<template>
  <div class="body">
    <div class="wrap">
      <!-- 顶部数据 -->
      <div class="nums flex">
        <draggable
          v-model="nums"
          item-key="title"
          draggable=".n-i"
          @end="onnumsend"
        >
          <template #item="{ element }">
            <div class="n-i">
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
        </draggable>
      </div>
      <!-- 顶部数据end -->

      <!-- 图表和项目动态 -->
      <div class="flexs" style="margin-top: 15px">
        <!-- 图表 -->
        <div class="tb">
          <div class="item">
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
          <div class="item" style="margin-top: 15px">
            <div class="t">
              <div id="chart2" style="width: 100%; height: 400px"></div>
            </div>
          </div>
        </div>
        <!-- 图表end -->
        <!-- 项目动态 -->
        <div class="xm tb item">
          <h4 class="i-t flexs">项目动态</h4>
          <!--时间线 -->

          <div class="timeline">
            <el-scrollbar height="620px">
              <div class="t-i flex" v-for="d in timeline">
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
            </el-scrollbar>
          </div>

          <!--时间线end -->
        </div>
        <!-- 项目动态end -->
      </div>
      <!-- 图表和项目动态end -->

      <!-- 容器 -->
      <div></div>
    </div>

    <!-- <div class="grid-stack"></div> -->
    <!-- <card :element="nums[0]"></card> -->

    <div ref="gridRef" class="grid-stack">
      <div
        v-for="item in layout"
        :key="item.id"
        class="grid-stack-item"
        :gs-x="item.x"
        :gs-y="item.y"
        :gs-w="item.w"
        :gs-h="item.h"
      >
        <div class="grid-stack-item-content">
          <component :is="item.component" v-bind="item.props" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  import draggable from "vuedraggable";
  import VChart from "@visactor/vchart";
  import { GridStack } from "gridstack";
  import "gridstack/dist/gridstack.min.css";

  import { markRaw } from "vue";
  import card from "./components/card.vue";
  //使用markRaw避免组件被转换为响应式对象
  const cardComponent = markRaw(card);
  //顶部数据
  const nums = ref([
    {
      title: "项目任务总数",
      num: 2,
      progress: "0%",
      desc: "本月新增0个任务",
      icon: "Checked",
      bg: "#F17048",
    },
    {
      title: "正常进行",
      num: 0,
      progress: "0%",
      desc: "正常进行环比",
      icon: "TrendCharts",
      bg: "#409C90",
    },
    {
      title: "预期进行",
      num: 0,
      progress: "0%",
      desc: "逾期进行环比",
      icon: "List",
      bg: "#E12B32",
    },
    {
      title: "已完成",
      num: 0,
      progress: "0%",
      desc: "已完成环比",
      icon: "Flag",
      bg: "#1D69E5",
    },
  ]);

  const layout = ref([
    {
      id: 1,
      x: 0,
      y: 0,
      w: 6,
      h: 3,
      component: cardComponent,
      props: { title: "趋势图", element: nums.value[0] },
    },
  ]);

  //图标
  const iconMap = {
    Checked,
    TrendCharts,
    List,
    Flag,
  };
  const chartRef = ref(null);

  //项目动态 - 时间线
  const timeline = ref([
    {
      avatar: require("@/assets/1.png"),
      name: "rowan",
      task: "任务1",
      task_desc: "新增任务文档 名称：1",
      time: "2025-08-11 11:23:00",
    },
    {
      avatar: require("@/assets/1.png"),
      name: "rowan",
      task: "重新新开一个项目",
      task_desc: "导出项目任务项目名称：重新新开一个项目",
      time: "2025-08-10 08:23:00",
    },
    {
      avatar: require("@/assets/2.png"),
      name: "张三",
      task: "任务2",
      task_desc: "导出项目任务项目名称：重新新开一个项目2",
      time: "2025-08-09 08:23:00",
    },
    {
      avatar: require("@/assets/1.png"),
      name: "李四",
      task: "写程序",
      task_desc: "重新创建了项目。出现bug",
      time: "2025-03-09 08:23:00",
    },
  ]);

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
      legends: { visible: true },
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
    render_line();

    // 初始化 grid
    const grid = GridStack.init(
      {
        cellHeight: 80, // 每个格子的高度
        column: 12, // 一行 12 列
        float: true, // 浮动布局
        resizable: { handles: "all" },
        draggable: { handle: ".grid-stack-item-content" },
      },
      ".grid-stack",
    );

    // 监听布局变化（保存 DIY 布局）
    grid.on("change", function (event, items) {
      console.log("布局变化:", items);
      // 这里可以保存 items 到后端数据库
    });

    // 关闭拖动
    // grid.enableMove(false)

    // 关闭缩放
    // grid.enableResize(false)
  });
  const disabled = ref(false);

  //所有模块
  const diy = ref([
    {
      type: "card",
      data: {
        title: "项目任务总数",
        num: 2,
        progress: "0%",
        desc: "本月新增0个任务",
        icon: "Checked",
        bg: "#F17048",
      },
    },
  ]);

  const onnumsend = (e) => {
    //这里拖动后数据变动了nums.value
    console.log("nums.value", nums.value);
  };
</script>

<style>
  .grid-stack-item-content {
    background: #1e88e5 !important;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
</style>
<style scoped>
  .n-i {
    background-color: white;
    width: 22%;
    padding: 0px 20px;
    border: 1px solid #e8e8e8;
  }

  /*  */
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
  /* ============== */
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
    height: 45px;
    padding: 0 15px;
    border-bottom: 1px solid #f1f1f1;
  }
  .tb {
    width: 49.5%;
    border: 1px solid #e8e8e8;
  }
  .item {
    /* border-radius: 8px; */
    overflow: hidden;
    background-color: #fff;
  }
  /*  ======*/

  .nums > div {
    width: 100%;
    justify-content: space-between;
    display: flex;
    align-items: center;
  }
  .wrap {
    padding: 16px;
    background-color: #ffffff;
  }
  .body {
    background-color: #f2f3f7;
    min-height: 100vh;
    width: 100vw;
  }

  .n-d {
    height: 35px;
    border-top: 1px solid #f1f1f1;
    font-size: 12px;
  }
  .n-d p {
    margin-right: 10px;
  }
</style>
