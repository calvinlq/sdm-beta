<template>
  <div>
    <CToolbar
      :fields="fields"
      :visibleButtons="toolbarOptions"
      :search-fields="['applicationTitle']"
      @openAddRecordDialog="handleAddLifecycle"
      @updateFieldVisibility="updateFieldVisibility"
      @lineHeightChanged="handleLineHeightChanged"
      @search="handleSearch"
      @close="close"
    ></CToolbar>
    <div class="wbs-tree-container">
      <!-- 批量操作浮层 -->
      <CLBatchOpToolbar
        :show="showCLBatchOpToolbar"
        :selected-count="selectedRecords.length"
        @delete="handleBatchDelete"
      >
        <!--        <button class="batch-btn">修改属性</button>-->
        <!--        <button class="batch-btn">修改类型</button>-->
      </CLBatchOpToolbar>
      <CLTable
        v-loading="loading"
        :fields="fields"
        :initial-data="tableData"
        :line-height="currentLineHeight"
        :on-add-node="handleAddNode"
        :on-delete-node="handleDeleteNode"
        :on-update-node="handleUpdateNode"
        :more-actions="moreActions"
        :tableConfig="tableConfig"
        @update:initial-data="updateTableData"
        @update:saveField="updateTableData"
        @node-selected="handleNodeSelected"
        @onMoreAction="handleMoreAction"
        @show:records="handleShowRecords"
      >
      </CLTable>
    </div>

    <el-pagination
      v-model:currentPage="tableListQuery.pageNo"
      v-model:page-size="tableListQuery.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totals"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="justify-content: end; padding-right: 10px; padding-top: 10px"
    />
    <CDialog
      :operate="operate"
      v-model="dialogVisible"
      @handleDialogOk="handleCreateOrEditLifecycle"
      :fields="dialogFields"
      :nodeData="selectedNode"
    ></CDialog>
  </div>
</template>
<script setup lang="ts">
  import { ElMessage, ElMessageBox } from "element-plus";
  import { provide, reactive, ref } from "vue";
  import CLTable from "@/components/CLTable/index.vue";
  import CToolbar from "@/components/CToolbar.vue";
  import CDialog from "@/components/CDialog.vue";
  import type { DynamicField } from "@/data/wbsFields.ts";
  import { useRouter } from "vue-router";

  import {
    mockFieldsLifeResponse,
    mockFieldsLifeCreate,
  } from "@/data/wbsFields.ts";
  import {
    type LifeCycleEntity,
    lifecycleType,
    type listLifeCycleParams,
  } from "@/interface/lifecycle.ts";
  import {
    createLifeCycle,
    deleteLifeCycle,
    listLifeCycle,
    copyLifeCycle,
    updateLifeCycle,
  } from "@/api/lifeCycle.ts";
  import type { ProjectNode } from "@/data/wbsData.ts";
  import CLBatchOpToolbar from "@/components/CLBatchOpToolbar.vue";

  const router = useRouter();
  const loading = ref(false);
  const operate = ref("create"); // CDialog 操作 create/edit
  const dialogVisible = ref(false); // CDialog 弹层展示
  const showCLBatchOpToolbar = ref(false);
  const selectedRecords = ref<LifeCycleEntity[]>([]);
  // 工具栏选项
  const toolbarOptions = ref({
    add: {
      name: "新增",
      enable: true,
    },
    fieldConfig: true,
    filter: true,
    sort: true,
    lineHeight: true,
    help: false,
    log: false,
    export: false,
  });
  const fieldConfigPosition = ref({ left: 0, top: 0 });
  const currentFields = ref<DynamicField[]>([]);
  const showFieldConfig = ref(false);
  // 当前行高设置
  const currentLineHeight = ref<"low" | "medium" | "high" | "ultra-high">(
    "low",
  );

  const handleShowRecords = (records: LifeCycleEntity[]) => {
    console.log("handleShowRecords", records);
    selectedRecords.value = records;
    showCLBatchOpToolbar.value = records.length > 0;
  };

  // 处理批量删除操作
  const handleBatchDelete = () => {
    if (selectedRecords.value.length === 0) return;

    // 调用删除节点的函数处理批量删除
    selectedRecords.value.forEach((record) => {
      handleDeleteNode(record);
    });

    // 删除完成后清空选中状态
    selectedRecords.value = [];
    showCLBatchOpToolbar.value = false;
  };
  // 更新字段可见性状态
  const updateFieldVisibility = (fieldId: number, invisible: boolean) => {
    const field = fields.value.find((f) => f.id === fieldId);
    if (field) {
      field.invisible = invisible;
    }
  };
  // 处理搜索事件
  const handleSearch = (keyword: string, searchFields?: string[]) => {
    console.log("搜索关键词:", keyword);
    console.log("搜索字段:", searchFields);
    // 实际项目中，这里可以调用API搜索数据
    // 例如: await axios.get('/api/wbs/search', { params: { keyword, searchFields } });

    // 前端搜索实现 - 过滤表格数据
    if (!keyword.trim()) {
      // 如果关键词为空，恢复原始数据
      fetchTableData();
      return;
    }

    // 搜索实现，根据ProjectNode结构搜索相关字段
    const filteredData = JSON.parse(JSON.stringify(projectSampleData));

    // 默认搜索字段
    const defaultSearchFields = ["name", "assignee", "status"];
    // 使用传入的搜索字段或默认字段
    const fieldsToSearch = searchFields?.length
      ? searchFields
      : defaultSearchFields;

    const searchInTree = (data: ProjectNode[]): ProjectNode[] => {
      return data.filter((node): boolean => {
        // 搜索当前节点
        let matchesSearch = false;

        // 根据指定的字段进行搜索
        for (const field of fieldsToSearch) {
          if (
            node[field as keyof ProjectNode] &&
            String(node[field as keyof ProjectNode])
              .toLowerCase()
              .includes(keyword.toLowerCase())
          ) {
            matchesSearch = true;
            break;
          }
        }

        // 如果有子节点，递归搜索
        if (node.children && node.children.length > 0) {
          node.children = searchInTree(node.children);
          // 如果当前节点不匹配但子节点有匹配，也保留当前节点
          return matchesSearch || (node.children && node.children.length > 0);
        }

        return matchesSearch;
      });
    };

    tableData.value = searchInTree(filteredData);
  };
  // 显示字段配置弹窗
  const showFieldConfigPopup = (position: { left: number; top: number }) => {
    fieldConfigPosition.value = position;
    currentFields.value = JSON.parse(JSON.stringify(fields.value || []));
    setTimeout(() => {
      showFieldConfig.value = !showFieldConfig.value;
    }, 100);
  };
  const addRecord = (newRecords: ProjectNode[]) => {
    tableData.value = [...newRecords];
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

  // 提供给所有子孙组件使用
  provide("addRecord", addRecord);
  provide("showFieldConfigPopup", showFieldConfigPopup);
  // 处理行高变化事件
  const handleLineHeightChanged = (
    lineHeight: "low" | "medium" | "high" | "ultra-high",
  ) => {
    console.log("行高已变更为:", lineHeight);
    currentLineHeight.value = lineHeight;
  };
  const dialogFields = ref<DynamicField[]>(mockFieldsLifeCreate); // 创建、编辑表单动态展示项
  const fields = ref<DynamicField[]>([]); // table表格展示列
  const tableListQuery = reactive<listLifeCycleParams>({
    pageNo: 1,
    pageSize: 20,
    sortParams: [],
    conditions: [],
  }); // table列表请求参数
  const tableData = ref<LifeCycleEntity[]>([]); // table数据
  const pageSize = ref(20);
  const pageNo = ref(1);
  const totals = ref(0); // table总数
  const selectedNode = ref<LifeCycleEntity>({});
  const moreActions = ref([
    { key: "edit", label: "编辑" },
    { key: "delete", label: "删除" },
    { key: "copy", label: "复制" },
    { key: "toSetting", label: "设置" },
  ]);
  const tableConfig = ref({
    editable: true,
    showOperationsColumn: true, // 是否显示操作列
    OperationsColumnMode: "text", // 操作列模式，text为文本模式
    OperationsColumnWidth: 150, //自定义操作列宽度
    frozenColCount: 3, // 冻结前面列数
    rightFrozenColCount: 1, // 冻结后面列数
    // tree: {
    //   enabled: true, // 开启树形结构
    //   column: 2, // 开启的树形结构的列索引
    //   mode: "wbs", // 开启wbs模式
    // },
    // rowSeriesNumber: {
    //   dragOrder: true, // 开启行号拖拽排序
    // },
    // borderMode: "none", // 表格边框模式，none为无边框
  });
  const getFields = () => {
    fields.value = mockFieldsLifeResponse;
  };
  getFields();
  const typeMap = {
    TASK: "任务",
    PROJECT: "项目",
  };
  const statusMap = {
    DISABLE: "禁用",
    NORMAL: "开启",
  };
  const getLifecycleTableData = async () => {
    loading.value = true;
    const res = await listLifeCycle(tableListQuery);
    loading.value = false;
    tableData.value = res.result?.map((item) => {
      item.typeName = typeMap[item.type];
      item.statusName = statusMap[item.status];
      return item;
    });
    totals.value = res.total;
    // tableListQuery.pageNo = res.pageNo;
    // tableListQuery.pageSize = res.pageSize;
  };
  getLifecycleTableData();
  // 更新表格数据的函数
  const updateTableData = (data: LifeCycleEntity[]) => {
    console.log("表格数据更新:", data);
    tableData.value = data;

    // 实际项目中，这里可以选择是否保存更新后的数据到后端
    // 例如: await axios.post('/api/wbs/save-all', data);
  };
  // 处理节点选择事件
  const handleNodeSelected = (nodes: LifeCycleEntity[]) => {
    // selectedNodes.value = nodes;
    console.log("handleNodeSelected", nodes);
  };
  const handleSizeChange = (size) => {
    tableListQuery.pageSize = size;
    getLifecycleTableData();
  };
  const handleCurrentChange = (pageNo) => {
    tableListQuery.pageNo = pageNo;
    getLifecycleTableData();
  };
  const handleMoreAction = (action: string, index: number) => {
    const node = tableData.value[index - 1];
    console.log("handleMoreAction", action, node);
    if (action === "edit") {
      operate.value = "edit";
      selectedNode.value = { ...node };
      dialogVisible.value = true;
    } else if (action === "delete") {
      ElMessageBox.confirm("确定删除该生命周期?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true,
      })
        .then(() => {
          deleteLifecycleAction(node.id!);
        })
        .catch(() => {});
    } else if (action === "copy") {
      copyLifecycleActive(node.id!);
    } else if (action === "toSetting") {
      router.push(`/editLifecycle?id=${node.id!}`);
    }
  };
  const deleteLifecycleAction = async (id: string) => {
    await deleteLifeCycle(id);
    ElMessage({
      type: "success",
      message: "删除成功",
    });
    getLifecycleTableData();
  };
  const copyLifecycleActive = async (id: string) => {
    await copyLifeCycle(id);
    ElMessage({
      type: "success",
      message: "复制成功",
    });
    getLifecycleTableData();
  };
  const close = () => {};
  const handleAddLifecycle = () => {
    //
    dialogVisible.value = true;
    operate.value = "create";
  };

  const handleCreateOrEditLifecycle = async (formData) => {
    if (operate.value === "create") {
      const params: LifeCycleEntity = {
        name: {
          zh_CN: formData.name,
          en_US: "task lifecycle test2",
        },
        type: formData.type,
        model: "",
        status: formData.status,
        remark: formData.remark,
        statusCard: "",
        layout: "",
      };
      const res = await createLifeCycle(params);
      ElMessage({
        message: "创建成功",
        type: "success",
      });
      dialogVisible.value = false;
      getLifecycleTableData();
    } else {
      // const params = {
      //   ...selectedNode.value,
      //   ...formData,
      //   name: {
      //     zh_CN: formData.name,
      //     en_US: "task lifecycle test2",
      //   },
      // };
      // delete params.i18nColumnMap;
      await updateLifeCycle({
        id: selectedNode.value.id,
        ...formData,
        name: {
          zh_CN: formData.name,
          en_US: "task lifecycle test2",
        },
      });
      ElMessage({
        message: "编辑成功",
        type: "success",
      });
      dialogVisible.value = false;
      getLifecycleTableData();
    }
    console.log(formData, "handleCreateLifecycle");
  };
</script>
<style lang="scss" scoped></style>
<style scoped>
  .wbs-container {
    background-color: #ffffff;
  }

  .wbs-tree-container {
    background-color: #fff;
    padding: 0 20px;
    position: relative;
  }

  .batch-btn {
    padding: 4px 12px;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 12px;
    color: #646a73;
  }

  .batch-btn:hover {
    color: #646a73;
    background-color: rgba(31, 35, 41, 0.1);
  }

  /* 滚动条样式 */
  .wbs-tree-container::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .wbs-tree-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .wbs-tree-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .wbs-tree-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
