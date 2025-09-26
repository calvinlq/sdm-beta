<template>
  <div style="position: relative">
    <el-tooltip
      placement="top"
      effect="light"
      :enterable="true"
      teleported
      :append-to="props.appendTo"
      trigger="hover"
    >
      <div @click="isShowPopover = !isShowPopover" class="edgeButtonContainer">
        <el-icon size="14" color="#707070"><MoreFilled /></el-icon>
      </div>
      <template #content>
        <ul class="edgeTooltipClass">
          <li>状态名称：进行中</li>
          <li>状态名称：进行中</li>
          <li>状态名称：进行中</li>
        </ul>
      </template>
    </el-tooltip>
    <div v-show="isShowPopover" class="edgePopoverClass">
      <ul class="popoverList">
        <li @click="handleSetting" class="popoverItem">工作项状态流转设置</li>
        <li @click="handleDelEdge" class="popoverItem">删除流转连线</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { MoreFilled } from "@element-plus/icons-vue";
  import { ElIcon, ElTooltip } from "element-plus";
  import { ref } from "vue";
  import { CellView } from "@antv/x6";
  const props = defineProps({
    appendTo: {
      type: HTMLElement,
      default: () => null,
    },
    cellView: {
      type: CellView,
      default: () => {},
    },
  });

  const isShowPopover = ref(false);
  const handleSetting = () => {};

  const handleDelEdge = () => {
    console.log(
      props.cellView.graph.removeCell(props.cellView.cell),
      "handleDelEdge",
    );
  };
</script>

<style scoped lang="scss">
  .edgeButtonContainer {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid #d9dde2;
    background: #f4f5f7;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .edgeTooltipClass {
    width: 180px !important;
    padding: 0 15px !important;
  }
  .edgePopoverClass {
    position: absolute;
    width: 130px;
    top: 27px;
    border: 1px solid #d9dde2;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.16);
    background: #fff;
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
