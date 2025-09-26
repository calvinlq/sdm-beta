<template>
  <div
    :style="{
      borderColor: nodeData.statusInfo.color,
      backgroundColor: nodeData.statusInfo.backgroundColor,
    }"
    class="baseNodeContainer"
  >
    <el-icon :color="nodeData.statusInfo.color">
      <CircleCheck />
    </el-icon>
    <span class="statusName">{{ nodeData.statusInfo.name }}</span>
    <el-popover
      v-model:visible="morePop"
      placement="bottom-start"
      :width="200"
      trigger="contextmenu"
      content="这是一段内容,这是一段内容,这是一段内容,这是一段内容"
      :show-arrow="false"
      popper-class="customPopoverClass"
    >
      <template #reference>
        <el-icon @click="handleMoreClick" size="14" color="#707070">
          <MoreFilled />
        </el-icon>
      </template>
      <template #default>
        <div class="nodeMorePopoverClass">
          <ul class="popoverList">
            <li class="popoverItem">工作项状态设置</li>
            <li @click="handleDelNode" class="popoverItem">删除工作项状态</li>
          </ul>
        </div>
      </template>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
  import { Cell } from "@antv/x6";
  import { inject, onMounted, ref } from "vue";
  import { CircleCheck, MoreFilled } from "@element-plus/icons-vue";
  import type { lifecycleBaseNodeDataType } from "@/views/lifecycle/interface";

  const getNode = inject("getNode") as () => Cell<Cell.Properties>;

  const nodeData = ref<lifecycleBaseNodeDataType>({
    nodeInfo: null,
    statusInfo: {
      name: "",
      color: "",
      icon: "",
      backgroundColor: "",
    },
  });
  const morePop = ref(false);

  const handleMoreClick = () => {
    console.log("handleMoreClick");
    morePop.value = !morePop.value;
  };
  const handleDelNode = () => {
    const node = getNode();
    node.model?.removeCell(node);
    console.log("handleDelNode", node.model?.removeCell(node));
  };
  onMounted(() => {
    const node = getNode();
    nodeData.value = node.getData();
    // console.log(node.getData(), "node");
    node.on("change:data", (node) => {
      // console.log("change:node", node);
    });
  });
</script>

<style scoped lang="scss">
  .baseNodeContainer {
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0 10px;
    box-sizing: border-box;

    .statusName {
      flex: 1;
      font-size: 12px;
      color: #2e405e;
      margin-left: 5px;
      line-height: 17px;
    }
  }

  .nodeMorePopoverClass {
    .popoverList {
      padding: 0;
      margin: 6px 0;
      list-style: none;

      .popoverItem {
        font-size: 12px;
        color: #2e405e;
        height: 26px;
        padding: 0 10px;
        line-height: 26px;
        background: #fff;
        transition: background-color 0.2s;
        cursor: pointer;

        &:hover {
          background: #f5f6f8;
        }
      }
    }
  }
</style>
<style lang="scss">
  .customPopoverClass {
    padding: 0 !important;
    width: 120px !important;
    min-width: 120px !important;
  }
</style>
