<template>
  <div class="data-toolbar-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <template v-for="button in toolbarButtons" :key="button.key">
          <el-button
            :type="button.type"
            v-if="isButtonVisible(button.key)"
            @click="button.handler"
          >
            <el-icon v-if="button.icon">
              <component :is="button.icon" />
            </el-icon>
            {{ button.label }}
          </el-button>
        </template>
      </div>
      <div class="toolbar-right">
        <el-button
          v-if="props.visibleButtons?.openWorkDir !== false"
          class="toolbar-btn"
          @click="handleOpenWorkDir"
        >
          打开任务工作目录
        </el-button>
        <el-button
          v-if="props.visibleButtons?.checkInFileSettings !== false"
          class="toolbar-btn"
          @click="handleImport"
        >
          检入文件设置
        </el-button>
      </div>
    </div>

    <!-- 表格容器 -->
    <div>
      <wbsTable
        v-if="props.tabIndex === 2"
        :fields="fields"
        :initial-data="tableData"
        :on-add-node="handleAddNode"
        :on-delete-node="handleDeleteNode"
        :on-update-node="handleUpdateNode"
        @update:initial-data="updateTableData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from "vue";
  import { ElIcon } from "element-plus";
  import {
    Plus,
    Upload,
    Download,
    Delete,
    EditPen,
  } from "@element-plus/icons-vue";
  import WbsTable from "@/views/project/wbsTable.vue";
  import {
    type DynamicField,
    mockFieldsProjectResponse,
  } from "@/data/wbsFields.ts";
  import { type ProjectNode, projectSampleData } from "@/data/wbsData.ts";

  // 定义props
  interface ToolbarProps {
    tabIndex: number;
    visibleButtons?: {
      add?: boolean;
      import?: boolean;
      export?: boolean;
      batchDelete?: boolean;
      checkIn?: boolean;
      checkOut?: boolean;
      delete?: boolean;
      submit?: boolean;
      openWorkDir?: boolean;
      checkInFileSettings?: boolean;
      association?: boolean;
      edit?: boolean;
      unAssociation?: boolean;
    };
  }
  // 定义按钮配置的类型
  interface ToolbarButton {
    key: keyof NonNullable<ToolbarProps["visibleButtons"]>;
    label: string;
    type?: "primary" | "success" | "warning" | "danger" | "info";
    icon?: any;
    handler: () => void;
  }

  const props = defineProps<ToolbarProps>();
  // 定义事件
  const $emit = defineEmits<{
    (e: "add-record"): void;
    (e: "import-data"): void;
    (e: "export-data"): void;
    (e: "batch-delete"): void;
    (e: "submit-hpc"): void;
    (e: "open-work-dir"): void;
    (e: "row-click", row: any): void;
    (e: "edit", row: any): void;
    (e: "delete", row: any): void;
    (e: "link", row: any): void;
  }>();
  const toolbarButtons = computed((): ToolbarButton[] => [
    {
      key: "add",
      label: "新建节点",
      type: "primary",
      icon: Plus,
      handler: openAddRecordDialog,
    },
    {
      key: "import",
      label: "导入",
      type: undefined,
      icon: Upload,
      handler: handleImport,
    },
    {
      key: "association",
      label: "关联",
      type: undefined,
      icon: undefined,
      handler: handleBatchDelete,
    },
    {
      key: "export",
      label: "导出",
      type: undefined,
      icon: Download,
      handler: handleExport,
    },
    {
      key: "unAssociation",
      label: "取消关联",
      type: undefined,
      icon: undefined,
      handler: handleBatchDelete,
    },
    {
      key: "edit",
      label: "编辑",
      type: undefined,
      icon: EditPen,
      handler: handleBatchDelete,
    },
    {
      key: "batchDelete",
      label: "批量删除",
      type: undefined,
      icon: Delete,
      handler: handleBatchDelete,
    },
    {
      key: "checkIn",
      label: "检入",
      type: undefined,
      icon: undefined,
      handler: handleBatchDelete,
    },
    {
      key: "checkOut",
      label: "检出",
      type: undefined,
      icon: undefined,
      handler: handleBatchDelete,
    },
    {
      key: "delete",
      label: "删除",
      type: undefined,
      icon: undefined,
      handler: handleBatchDelete,
    },
    {
      key: "submit",
      label: "提交HPC计算",
      type: undefined,
      icon: undefined,
      handler: handleSubmit,
    },
  ]);
  const fields = ref<DynamicField[]>([]);
  const tableData = ref<ProjectNode[]>([]);
  // 判断按钮是否可见的函数
  const isButtonVisible = (
    key: keyof NonNullable<ToolbarProps["visibleButtons"]>,
  ): boolean => {
    // 如果没有提供visibleButtons属性，则所有按钮都可见
    if (!props.visibleButtons) {
      return true;
    }
    // 如果提供了visibleButtons属性，则检查对应按钮是否不为false
    return props.visibleButtons[key] !== false;
  };
  // 处理各种按钮点击事件
  const openAddRecordDialog = () => {
    $emit("add-record");
  };

  const handleImport = () => {
    $emit("import-data");
  };

  const handleExport = () => {
    $emit("export-data");
  };

  const handleBatchDelete = () => {
    $emit("batch-delete");
  };

  const handleSubmit = () => {
    $emit("submit-hpc");
  };

  const handleOpenWorkDir = () => {
    $emit("open-work-dir");
  };

  const handleRowClick = (row: any) => {
    $emit("row-click", row);
  };

  const handleEdit = (row: any) => {
    $emit("edit", row);
  };

  const handleDelete = (row: any) => {
    $emit("delete", row);
  };

  const handleLink = (row: any) => {
    $emit("link", row);
  };

  // 从后端获取字段数据
  const fetchFields = async () => {
    try {
      // 这里应该是实际的API调用，例如：
      // const response = await axios.get('/api/wbs/fields');
      // fields.value = response.data;

      // 模拟API调用，使用外部引入的数据
      // 实际项目中请替换为真实的API请求

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      // 对mock数据进行类型转换，确保options的value类型为string
      fields.value = mockFieldsProjectResponse.map((field) => ({
        ...field,
        options: field.options
          ? field.options.map((option) => ({
              ...option,
              value: String(option.value),
            }))
          : undefined,
      }));
    } catch (error) {
      console.error("获取字段数据失败:", error);
      // 可以在这里设置默认数据作为后备
    }
  };

  // 从后端获取表格数据
  const fetchTableData = async () => {
    try {
      // 这里应该是实际的API调用，例如：
      // const response = await axios.get('/api/wbs/data');
      // tableData.value = response.data;

      // 模拟API调用，使用外部引入的数据
      // 实际项目中请替换为真实的API请求

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      tableData.value = JSON.parse(JSON.stringify(projectSampleData));
    } catch (error) {
      console.error("获取表格数据失败:", error);
    }
  };
  // 添加节点的钩子函数
  const handleAddNode = (parentNode: ProjectNode, newNode: ProjectNode) => {
    console.log("添加节点:", parentNode, newNode);

    // 实际项目中，这里应该调用API保存数据
    // 例如: await axios.post('/api/wbs/add', { parentId: parentNode.id, node: newNode });

    // 这里仅作前端演示，实际添加逻辑由wbsTable组件内部处理
    // 如果需要在父组件中处理添加逻辑，可以在这里实现
  };

  // 删除节点的钩子函数
  const handleDeleteNode = (node: ProjectNode) => {
    console.log("删除节点:", node);

    // 实际项目中，这里应该调用API删除数据
    // 例如: await axios.delete('/api/wbs/delete', { params: { id: node.id } });

    // 这里仅作前端演示，实际删除逻辑由wbsTable组件内部处理
    // 如果需要在父组件中处理删除逻辑，可以在这里实现
  };

  // 更新节点的钩子函数
  const handleUpdateNode = (node: ProjectNode, field: string, value: any) => {
    console.log("更新节点:", node, field, value);

    // 实际项目中，这里应该调用API更新数据
    // 例如: await axios.put('/api/wbs/update', { id: node.id, field, value });

    // 这里仅作前端演示，实际更新逻辑由wbsTable组件内部处理
    // 如果需要在父组件中处理更新逻辑，可以在这里实现
  };

  // 更新表格数据的函数
  const updateTableData = (data: ProjectNode[]) => {
    console.log("表格数据更新:", data);
    tableData.value = data;

    // 实际项目中，这里可以选择是否保存更新后的数据到后端
    // 例如: await axios.post('/api/wbs/save-all', data);
  };

  onMounted(() => {
    fetchFields();
    fetchTableData();
  });
</script>

<style scoped lang="scss">
  .toolbar {
    background: #fff;
    padding: 9px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .table-container {
    width: 100%;
    height: calc(100vh - 150px);
    overflow: hidden;
    background-color: white;
    margin-top: 16px;
  }
</style>
