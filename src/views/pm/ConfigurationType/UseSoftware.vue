<template>
  <div v-if="props.changeView">
    <div class="container-card">
      <el-card
        v-for="(item, index) in props.softwareData"
        :key="index"
        shadow="never"
        class="card-item"
        header-class="card-button"
        @click="handleCardClick(item)"
      >
        <template #header>
          <el-checkbox
            v-model="item.checked"
            @change="(checked: boolean) => handleCheckboxChange(checked, item)"
            @click.stop
          ></el-checkbox>
        </template>

        <div class="card-body">
          <img :src="item.image" style="width: 50%" />
        </div>

        <template #footer>
          <div class="card-footer">
            <span class="software-name">{{ item.name }}</span>
            <span class="description">{{ item.description }}</span>
          </div>
        </template>
      </el-card>
    </div>
  </div>
  <div v-else class="container-table">
    <CLTable
      :fields="props.fields"
      :initial-data="props.softwareData"
      :line-height="currentLineHeight"
      :tableConfig="tableConfig"
      :more-actions="moreActions"
      :router-fields="routerFields"
      @onMoreAction="handleMoreAction"
    >
    </CLTable>
  </div>
</template>

<script lang="ts" setup>
  import type { SoftwareField, SoftwareNode } from "@/data/wbsFields.ts";
  import CLTable from "@/components/CLTable/index.vue";
  import { ref } from "vue";
  interface UseSoftwareProps {
    changeView: boolean;
    fields: SoftwareField[];
    softwareData: SoftwareNode[];
  }

  // 定义事件发射器
  const emit = defineEmits<{
    (event: "selection-change", data: SoftwareNode | undefined): void;
    (event: "selection-view", data: SoftwareNode): void;
  }>();
  const props = defineProps<UseSoftwareProps>();
  const selectedData = ref<SoftwareNode | undefined>();
  const routerFields = ref(["name"]);

  // 处理复选框变化
  const handleCheckboxChange = (
    checked: boolean | string | number,
    item: SoftwareNode,
  ) => {
    if (checked) {
      props.softwareData.forEach((softwareItem) => {
        if (softwareItem !== item) {
          softwareItem.checked = false;
        }
      });
      selectedData.value = item;
    } else {
      // 从选中数据中移除
      selectedData.value = undefined;
    }
    // 触发自定义事件，将选中数据传递给父组件
    emit("selection-change", selectedData.value);
  };

  const currentLineHeight = ref<"low" | "medium" | "high" | "ultra-high">(
    "low",
  );
  const tableConfig = ref({
    editable: true,
    showOperationsColumn: true, // 是否显示操作列
    OperationsColumnMode: "text", // 操作列模式，text为文本模式
    OperationsColumnWidth: 80, //自定义操作列宽度
    frozenColCount: 0, // 冻结前面列数
    rightFrozenColCount: 1, // 冻结后面列数
    tree: {
      enabled: false, // 开启树形结构
      column: 2, // 开启的树形结构的列索引
      // mode: "wbs", // 开启wbs模式
    },
    rowSeriesNumber: {
      dragOrder: false, // 开启行号拖拽排序
    },
    enableCustomDrag: true,
    // borderMode: "none", // 表格边框模式，none为无边框
  });
  const moreActions = ref([
    // { key: "visit", label: "访问项目" },
    // { key: "favorite", label: "收藏项目" },
    { key: "view", label: "查看" },
    { key: "edit", label: "编辑" },
    // { key: "setting", label: "项目设置" },
    { key: "delete", label: "删除" },
    // { key: "recycle", label: "回收站" },
  ]);
  const handleMoreAction = (key: string, data: SoftwareNode) => {
    console.log(key, data);
    if (key === routerFields.value[0]) {
      emit("selection-view", data);
    }
  };
  const handleCardClick = (item: SoftwareNode) => {
    console.log("卡片被点击:", item);
  };
</script>
<style scoped lang="scss">
  :deep(.card-button) {
    height: 30px;
    margin: 0;
    display: flex;
    align-items: center;
    border-bottom: 0;
  }
  :deep(.el-card__footer) {
    padding: 10px;
  }
  :deep(.el-card__body) {
    margin: 0;
    padding: 10px 0;
  }
  :deep(.card-footer) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0;
  }
  .software-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    width: 200px;
    display: flex;
    justify-content: center;
  }
  .card-body {
    display: flex;
    justify-content: center;
  }
  .description {
    margin-top: 5px;
    font-size: 12px;
    width: 200px;
    display: flex;
    justify-content: center;
  }
  .container-card {
    margin: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); // 自动换行
    gap: 16px; // 卡片间距
  }
  .card-item {
    max-width: 100%; // 让卡片在格子里自适应
    width: 210px;
  }
  .container-table {
    margin: 10px;
  }
  .card-item:hover {
    cursor: pointer;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  }
</style>
