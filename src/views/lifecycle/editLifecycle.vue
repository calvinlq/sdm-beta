<template>
  <div class="pageContainer" id="boxDiv">
    <!--  左侧Dnd  -->
    <div id="resizeL" class="containerLeft" v-show="showAside">
      <div class="leftTop">
        <span>工作项状态</span>
        <el-button
          @click="handleAddStatus"
          size="small"
          type="primary"
          :icon="Plus"
          >新建状态
        </el-button>
      </div>
      <el-input
        v-model="searchStatus"
        style="width: 100%"
        placeholder="搜索状态名称"
        :suffix-icon="Search"
      />
      <ul id="Dnd" class="statusList">
        <li
          :style="{
            borderColor: item.color,
            backgroundColor: item.backgroundColor,
          }"
          v-for="(item, index) in statusList"
          :key="index"
          class="statusItem"
          data-type="lifecycle-base-node"
          @mousedown="startDrag(item, $event)"
        >
          <el-icon :color="item.color">
            <CircleCheck />
          </el-icon>
          <span class="statusName">{{ item.name }}</span>
        </li>
      </ul>
    </div>
    <div id="docCenter" class="dragCenterLine" :class="showAside ? 'w1' : 'w0'">
      <div
        class="button button-drag"
        @click="ifShowAside"
        @mousedown.stop=""
        @mouseup.stop=""
      ></div>
    </div>
    <div id="resizeR" class="containerRightContent">
      <div class="lifecycleCanvasContainer">
        <div class="graph" id="graph-container"></div>
        <TeleportContainer />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import "./components/registerTools.ts";
  import "./components/registerNode.js";
  import dragDiv from "@/utils/dragDiv.ts";
  import { ref, onMounted, nextTick, reactive } from "vue";
  import { useRoute } from "vue-router";
  import { Plus, Search, CircleCheck, Setting } from "@element-plus/icons-vue";
  import type { statusType } from "@/views/lifecycle/interface";
  import { Graph, Shape } from "@antv/x6";
  import { Transform } from "@antv/x6-plugin-transform";
  import { Selection } from "@antv/x6-plugin-selection";
  import { Snapline } from "@antv/x6-plugin-snapline";
  import { Keyboard } from "@antv/x6-plugin-keyboard";
  import { Clipboard } from "@antv/x6-plugin-clipboard";
  import { History } from "@antv/x6-plugin-history";
  import { Dnd } from "@antv/x6-plugin-dnd";
  import { getTeleport } from "@antv/x6-vue-shape";
  import {
    listLifeCycle,
    createLifeCycle,
    type listLifeCycleParams,
    type LifeCycleEntity,
    getLifeCycle,
    updateLifeCycle,
  } from "@/api/lifeCycle.ts";
  import type { createLifeCycleParams } from "@/interface/lifecycle.ts";

  const TeleportContainer = getTeleport();
  const route = useRoute();

  const showAside = ref(true);
  const ifShowAside = () => {};

  // Dnd
  let dnd: Dnd | null = null;
  const statusList = ref<statusType[]>([
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
    {
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    },
  ]);
  const searchStatus = ref("");
  const initDnd = () => {
    dnd = new Dnd({
      target: graph!,
      scaled: false,
      dndContainer: document.getElementById("Dnd")!,
      getDropNode(node) {
        const nodeData = node.getData();
        // 返回一个新的节点作为实际放置到画布上的节点
        const newNode = graph!.createNode({
          shape: "lifecycle-base-node",
          label: "步骤",
          data: {
            ...nodeData,
          },
        });
        return newNode;
      },
    });
  };
  const handleAddStatus = () => {
    statusList.value.push({
      name: "已完成",
      icon: "CircleCheck",
      color: "#69a455",
      backgroundColor: "#f1f1f1",
    });
  };
  const startDrag = (item: statusType, e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    // console.log("startDrag", item);
    const type = target.getAttribute("data-type");
    let node;
    if (type === "lifecycle-base-node") {
      node = graph!.createNode({
        shape: "lifecycle-base-node",
        label: "步骤",
        data: {
          statusInfo: item,
        },
      });
    }
    if (node) dnd!.start(node, e);
  };

  // Graph
  let graph: Graph | null = null;
  const initGraph = () => {
    graph = new Graph({
      container: document.getElementById("graph-container")!,
      virtual: true,
      grid: {
        size: 10,
        visible: true,
        args: {
          color: "#a0a0a0", // 网点颜色
          thickness: 1, // 网点大小
        },
      },
      panning: true, // 可移动
      autoResize: true,
      interacting: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: "ctrl",
        minScale: 0.1,
        maxScale: 3,
      },
      connecting: {
        router: "manhattan",
        connector: {
          name: "rounded",
          args: {
            radius: 8,
          },
        },
        anchor: "center",
        connectionPoint: "anchor",
        allowBlank: false,
        allowLoop: false,
        allowNode: true,
        snap: {
          radius: 20,
        },
        createEdge() {
          // console.log('createEdge', e)
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: "#A2B1C3",
                strokeWidth: 2,
                targetMarker: {
                  name: "block",
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: "stroke",
          args: {
            attrs: {
              fill: "#5F95FF",
              stroke: "#5F95FF",
            },
          },
        },
      },
      translating: { restrict: true },
    });
    // #region 使用插件
    graph
      .use(
        new Transform({
          // resizing: false,
          resizing: false,
          rotating: false,
        }),
      )
      .use(
        new Selection({
          enabled: false,
          rubberband: true,
          showNodeSelectionBox: true,
        }),
      )
      .use(new Snapline())
      .use(new Keyboard())
      .use(new Clipboard())
      .use(new History());
    // 控制连接桩显示/隐藏
    const showPorts = (ports: NodeListOf<Element>, show: boolean) => {
      for (let i = 0, len = ports.length; i < len; i += 1) {
        ports[i].style.visibility = show ? "visible" : "hidden";
      }
    };
    graph.bindKey("delete", () => {
      if (!graph) return;
      const cells = graph.getSelectedCells();
      // console.log("cells", cells);
      if (cells.length === 0) return;
      graph.removeCells(cells);
    });
    // 移动节点
    graph.on("node:moved", ({ e, x, y, node, view }) => {
      // console.log('node:moved', node, x, y)
      updateListLifeCycleLayout();
    });
    graph.on("node:added", ({ node }) => {
      // 添加节点
      // console.log("node", node);
      updateListLifeCycleLayout();
    });
    graph.on("edge:connected", ({ edge, isNew }) => {
      if (isNew) {
        updateListLifeCycleLayout();
      }
    });
    graph.on("cell:removed", ({ cell }) => {
      // console.log("cell", cell);
      updateListLifeCycleLayout();
    });
    graph.on("cell:click", ({ cell }) => {
      // console.log("cell", cell);
      graph?.resetSelection([cell]);
    });
    graph.on("edge:mouseenter", ({ edge }) => {
      edge.addTools({
        name: "lifecycleEdgeTool",
        args: {
          tooltip: "Tooltip Content",
        },
      });
    });
    graph.on("edge:mouseleave", ({ edge }) => {
      edge.removeTool("lifecycleEdgeTool");
    });
    graph.on("edge:selected", ({ edge }) => {
      edge.attr("line/stroke", "#1890ff");
      edge.attr("line/strokeWidth", 3);
      edge.setZIndex(1); // 提高层级
    });
    graph.on("edge:unselected", ({ edge }) => {
      edge.attr("line/stroke", "#A2B1C3");
      edge.attr("line/strokeWidth", 2);
      edge.setZIndex(0); // 恢复层级
    });
    graph.on("node:mouseenter", ({}) => {
      const container = document.getElementById("graph-container")!;
      const ports = container.querySelectorAll(".x6-port-body");
      showPorts(ports, true);
    });
    graph.on("node:mouseleave", () => {
      const container = document.getElementById("graph-container")!;
      const ports = container.querySelectorAll(".x6-port-body");
      showPorts(ports, false);
    });
  };

  // 自适应缩放函数
  const fitGraphContent = (padding = 50, maxZoom = 1, minZoom = 0.6) => {
    // 获取所有单元格的边界
    const cells = graph!.getCells();
    if (cells.length === 0) return;

    // 计算内容边界
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    cells.forEach((cell) => {
      const bbox = cell.getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    });

    // 计算需要的缩放比例
    const graphWidth = graph!.container.clientWidth;
    const graphHeight = graph!.container.clientHeight;

    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const scaleX = graphWidth / contentWidth;
    const scaleY = graphHeight / contentHeight;

    // 选择较小的缩放比例以确保内容完全可见
    let zoom = Math.min(scaleX, scaleY);

    // 限制缩放范围
    zoom = Math.min(maxZoom, Math.max(minZoom, zoom));

    // 计算中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    // console.log(zoom, centerX, centerY, "centerX");
    // 应用缩放和平移
    graph!.zoomTo(zoom, {
      // absolute: true,
      center: {
        x: centerX,
        y: centerY,
      },
    });

    // 将内容居中
    graph!.centerContent();
  };

  let lifecycleDetails = ref<LifeCycleEntity>({});
  const renderGraph = () => {
    if (lifecycleDetails.value.layout) {
      graph?.fromJSON(JSON.parse(lifecycleDetails.value.layout));
    }
    fitGraphContent();
  };

  // 保存画布布局
  const updateListLifeCycleLayout = async () => {
    console.log(graph?.toJSON(), "graph?.toJSON()");
    // return;
    const params: createLifeCycleParams = {
      id: route.query.id,
      layout: JSON.stringify(graph?.toJSON()),
      name: lifecycleDetails.value.name,
      remark: lifecycleDetails.value.remark,
      status: lifecycleDetails.value.status,
      statusCard: lifecycleDetails.value.statusCard,
      model: lifecycleDetails.value.model,
      type: lifecycleDetails.value.type,
    };
    await updateLifeCycle(params);
  };

  const getLifecycleDetails = async () => {
    // console.log("getLifecycleDetails", route.query);
    const res = await getLifeCycle(route.query.id);
    lifecycleDetails.value = res;
    // console.log(lifecycleDetails.value, "lifecycleDetail");
  };
  onMounted(async () => {
    initGraph();
    initDnd();
    await getLifecycleDetails();
    renderGraph();
    nextTick(() => {
      dragDiv("docCenter", "resizeL", "resizeR", "boxDiv", 200);
    });
    setTimeout(() => {
      graph.centerPoint(0, 0);
    }, 100);
  });
</script>

<style scoped lang="scss">
  .pageContainer {
    width: 100vw;
    height: 100vh;
    display: flex;

    .dragCenterLine {
      cursor: w-resize;
    }

    .w0 {
      width: 0;
    }

    .w1 {
      width: 1px;
      background: #f1f1f1;
    }

    .containerLeft {
      width: 200px;
      height: 100%;
      padding: 0 12px;
      overflow: auto;

      .leftTop {
        display: flex;
        height: 32px;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        span {
          font-size: 14px;
          font-weight: bold;
          color: #303033;
        }
      }

      .statusList {
        user-select: none;
        list-style: none;
        padding: 0;
        margin: 15px 0 0 0;
        display: grid;
        gap: 10px 5px;
        grid-template-columns: 1fr 1fr;

        .statusItem {
          box-sizing: border-box;
          width: 100%;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 5px;
          border: 1px solid #0ab169;
          font-size: 12px;
          line-height: 17px;
          color: #2e405e;
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.15);

          .statusName {
            margin-left: 5px;
          }
        }
      }
    }

    .containerRightContent {
      flex: 1;

      .lifecycleCanvasContainer {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
  }
</style>
<style lang="scss" scoped>
  :deep(.x6-widget-selection-box) {
    display: none;
  }
</style>
