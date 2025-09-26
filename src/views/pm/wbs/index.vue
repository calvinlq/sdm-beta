<template>
  <div class="wbs-container">
    <CLTabs
      v-model="activeTab"
      :items="tabItems"
      @tab-added="handleTabAdded"
      @tab-removed="handleTabRemoved"
      @tab-sorted="handleTabSorted"
      @tab-activated="handleTabActivated"
    >
      <template #content="{ activeTab: tabItem }">
        <div v-if="tabItem && tabItem.id === 1">
          <indexView />
        </div>
        <div v-if="tabItem && tabItem.id === 2">
          <!-- 封装的Toolbar组件 -->
          <CToolbar
            :fields="fields"
            :visibleButtons="toolbarOptions"
            :search-fields="['applicationTitle']"
            @updateFieldVisibility="updateFieldVisibility"
            @updateField="updateField"
            @fieldReordered="handleFieldReordered"
            @lineHeightChanged="handleLineHeightChanged"
            @search="handleSearch"
            @filter="handleFilter"
            @sort="handleSort"
            @openAddRecordDialog="handleAddRecordDialog"
          />

          <!-- 任务树形结构 -->
          <div class="wbs-tree-container">
            <!-- 批量操作浮层 (使用封装的组件) -->
            <CLBatchOpToolbar
              :show="showCLBatchOpToolbar"
              :selected-count="selectedRecords.length"
              @delete="handleBatchDelete"
            >
              <button class="batch-btn" @click="handleModifyProperties">
                修改属性
              </button>
              <button class="batch-btn" @click="handleModifyType">
                修改类型
              </button>
            </CLBatchOpToolbar>
            <CLTable
              :fields="fields"
              :initial-data="tableData"
              :line-height="currentLineHeight"
              :router-fields="routerFields"
              :tableConfig="tableConfig"
              :more-actions="moreActions"
              :on-add-node="handleAddNode"
              :on-delete-node="handleDeleteNode"
              :on-update-node="handleUpdateNode"
              @update:initial-data="updateTableData"
              @update:saveField="updateTableData"
              @show:records="handleShowRecords"
              @onMoreAction="handleMoreAction"
            />
          </div>
          <!-- 字段配置悬浮层 -->
          <FieldConfigPopup
            :fields="currentFields"
            :position="fieldConfigPosition"
            :visible="showFieldConfig"
            @close="showFieldConfig = false"
            @fieldsChange="handleFieldsChange"
          />
        </div>

        <div v-if="tabItem && tabItem.id === 3">
          <!-- 封装的Toolbar组件 -->
          <CToolbar
            :fields="fields"
            :visibleButtons="toolbarOptions"
            :search-fields="['applicationTitle']"
            @updateFieldVisibility="updateFieldVisibility"
            @updateField="updateField"
            @fieldReordered="handleFieldReordered"
            @lineHeightChanged="handleLineHeightChanged"
            @search="handleSearch"
            @filter="handleFilter"
            @sort="handleSort"
            @openAddRecordDialog="handleAddRecordDialog"
          />

          <!-- 任务树形结构 -->
          <div class="wbs-tree-container">
            <!-- 批量操作浮层 -->
            <CLBatchOpToolbar
              :show="showCLBatchOpToolbarGantt"
              :selected-count="selectedRecords.length"
              @delete="handleBatchDelete"
            >
              <button class="batch-btn">修改属性</button>
              <button class="batch-btn">修改类型</button>
            </CLBatchOpToolbar>
            <CLTable
              ref="clTableRef"
              :fields="fields"
              :initial-data="tableData"
              :initial-links="tableLinks"
              :timeScalesToShow="[]"
              :line-height="currentLineHeight"
              :router-fields="routerFields"
              :more-actions="moreActions"
              :tableConfig="ganttConfig"
              :on-add-node="handleAddNode"
              :on-delete-node="handleDeleteNode"
              :on-update-node="handleUpdateNode"
              @update:initial-data="updateTableData"
              @update:saveField="updateTableData"
              @view-node-detail="handleShowRecordDetail"
              @show:records="handleShowRecords"
              @node-selected="handleNodeSelected"
              @onMoreAction="handleMoreAction"
            />
          </div>
        </div>
      </template>
    </CLTabs>
    <div class="add-record-dialog-container">
      <AddRecordDialog
        v-if="drawerDisplay"
        :size="showAddRecordDialog"
        :fields="fields"
        :record="selectedRecord"
        :routerFields="dialogRouterFields"
        @close:size="closeRecordDialog"
        @update:formData="updateRecord"
      />
    </div>
  </div>
  <ModifyDialog
    :visible="showBatchModifyDialog"
    :dialog-type="batchModifyType"
    :selected-count="selectedRecords.length"
    :target-type="targetType"
    :fields="batchModifyFields"
    @confirm="handleBatchModifyConfirm"
    @cancel="handleBatchModifyCancel"
    @close:modify="handleBatchModifyClose"
  />
</template>

<script lang="ts" setup>
  import { ref, onMounted, provide } from "vue";

  import CLTabs from "@/components/CLTabs.vue";
  import CToolbar from "@/components/CToolbar.vue";
  import CLBatchOpToolbar from "@/components/CLBatchOpToolbar.vue";
  import CLTable from "@/components/CLTable/index.vue";
  import FieldConfigPopup from "@/components/FieldConfigPopup.vue";
  import indexView from "@/views/editable/index.vue";
  import { otherIcon, tableIcon, dateIcon } from "@/utils/SvgIcons.ts";
  import {
    mockFieldsProjectResponse,
    type SoftwareNode,
    type TabItem,
  } from "@/data/wbsFields.ts";
  import { mockFieldsResponse } from "@/data/wbsFields.ts";
  import {
    type ProjectNode,
    projectSampleData,
    tmpLinks,
  } from "@/data/wbsData.ts";
  import { wbsSampleData } from "@/data/wbsData.ts";
  import AddRecordDialog from "@/components/AddRecordDialog.vue";
  import ModifyDialog from "@/views/pm/wbs/ModifyDialog.vue";
  import type { FormItemRule } from "element-plus";

  // 标签页数据
  const activeTab = ref<number>(1);
  const tabItems = ref<TabItem[]>([
    {
      id: 1,
      title: "项目概览",
      icon: otherIcon,
      closable: false,
    },
    {
      id: 2,
      title: "任务列表",
      icon: tableIcon,
      closable: false,
    },
    {
      id: 3,
      title: "甘特视图",
      icon: tableIcon,
      closable: false,
    },
  ]);
  // 重新定义本地的DynamicField类型，确保类型兼容性
  interface DynamicField {
    id: number;
    name: string;
    field: string;
    type: string;
    invisible: boolean;
    options?: Array<{ value: string; label: string; tag?: string }>;
    rules?: FormItemRule[];
  }
  // 初始化字段数据（空数组，将从后端获取）
  const fields = ref<DynamicField[]>(
    mockFieldsProjectResponse.map((field) => ({
      ...field,
      // 确保options的value类型为string
      options: field.options
        ? field.options.map((option) => ({
            ...option,
            value: String(option.value),
          }))
        : undefined,
    })),
  );
  const routerFields = ref(["name"]);
  const dialogRouterFields = ref(["assignee", "startDate", "endDate"]);
  const moreActions = ref([
    // { key: "visit", label: "访问项目" },
    // { key: "favorite", label: "收藏项目" },
    { key: "view", label: "查看" },
    { key: "edit", label: "编辑" },
    // { key: "setting", label: "项目设置" },
    { key: "delete", label: "删除" },
    // { key: "recycle", label: "回收站" },
  ]);

  const tableConfig = ref({
    editable: true,
    typeIconShow: true, // 列表表格是否显示类型图标
    // showOperationsColumn: true, // 是否显示操作列
    // OperationsColumnMode: "text", // 操作列模式，text为文本模式
    // OperationsColumnWidth: 150, //自定义操作列宽度
    frozenColCount: 3, // 冻结前面列数
    rightFrozenColCount: 1, // 冻结后面列数
    tree: {
      enabled: true, // 开启树形结构
      column: 2, // 开启的树形结构的列索引
      mode: "wbs", // 开启wbs模式
    },
    rowSeriesNumber: {
      dragOrder: true, // 开启行号拖拽排序
    },
    enableCustomDrag: true,
    // borderMode: "none", // 表格边框模式，none为无边框
  });
  const ganttConfig = ref({
    ...tableConfig.value,
    mode: "gantt", // 开启甘特图
    // tree: {
    //   enabled: true, // 开启树形结构
    //   column: 2, // 开启的树形结构的列索引
    //   mode: "wbs", // 开启wbs模式
    // },
    taskListTable: {
      menu: {
        contextMenuItems: ["添加子记录", "删除"],
      },
      tableWidth: 458,
    },
    minDate: "2025/08/01",
    maxDate: "2025/12/31",
    enableCustomDrag: true,
  });

  // 工具栏选项
  const toolbarOptions = ref({
    add: {
      name: "添加",
      enable: true,
    },
    fieldConfig: true,
    filter: true,
    sort: true,
    lineHeight: true,
    search: true,
    // help: true,
    // log: true,
    // export: true,
  });

  // 字段配置弹窗相关状态
  const showFieldConfig = ref(false);
  const fieldConfigPosition = ref({ left: 0, top: 0 });
  const currentFields = ref<DynamicField[]>([]);

  // 初始化表格数据，将从父组件传递给wbsTable
  const tableData = ref<ProjectNode[]>([]);
  // 当前行高设置
  const currentLineHeight = ref<"low" | "medium" | "high" | "ultra-high">(
    "low",
  );
  const tableLinks = ref([]);
  const clTableRef = ref<InstanceType<typeof CLTable> | null>(null);
  // 用于存储用户选择的节点
  const selectedNodes = ref<ProjectNode[]>([]);

  // 处理节点选择事件
  const handleNodeSelected = (nodes: ProjectNode[]) => {
    selectedNodes.value = nodes;
  };
  const showCLBatchOpToolbarGantt = ref(false);
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
      tableLinks.value = JSON.parse(JSON.stringify(tmpLinks));
      if (clTableRef.value) {
        clTableRef.value.updateLinks(tableLinks.value);
      }
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
    // showAddRecordDialog.value = "0%";
    // 实际项目中，这里可以选择是否保存更新后的数据到后端
    // 例如: await axios.post('/api/wbs/save-all', data);
  };
  const updateRecord = (record: any) => {
    console.log("更新记录:", record);
    // 递归查找并更新节点
    const updateNodeById = (
      nodes: ProjectNode[],
      targetId: string,
      newData: any,
    ): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetId) {
          // 找到目标节点，更新数据
          nodes[i] = { ...nodes[i], ...newData };
          return true;
        }

        // 如果有子节点，递归查找
        if (nodes[i].children && nodes[i].children!.length > 0) {
          if (updateNodeById(nodes[i].children!, targetId, newData)) {
            return true;
          }
        }
      }
      return false;
    };
    // 在 tableData 中查找并更新记录
    updateNodeById(tableData.value, record.id, record);
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
    const filteredData = JSON.parse(JSON.stringify(wbsSampleData));

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

  // 处理排序事件
  const handleSort = (condition: string, direction: "asc" | "desc") => {
    console.log("排序条件:", condition, "排序方向:", direction);

    // 前端排序实现 - 对表格数据进行排序
    if (!tableData.value.length) return;

    // 复制数据以避免修改原始数据
    const sortedData = JSON.parse(JSON.stringify(tableData.value));

    // 根据条件进行排序
    const sortFieldMap: Record<string, string> = {
      task1: "name", // 任务描述1映射到name字段
      task2: "description", // 任务情况总结映射到description字段
      assignee: "assignee", // 任务执行人
      startDate: "startDate", // 开始日期
      endDate: "endDate", // 预计完成日期
      progress: "progress", // 进展
      delay: "isDelayed", // 是否延期
    };

    const sortField = sortFieldMap[condition] || "name";

    // 递归排序树形数据
    const sortTreeData = (data: ProjectNode[]) => {
      // 先对子节点进行排序
      data.forEach((node) => {
        if (node.children && node.children.length > 0) {
          node.children = sortTreeData(node.children);
        }
      });

      // 对当前层级进行排序
      return data.sort((a, b): number => {
        const valueA = (a as any)[sortField] || "";
        const valueB = (b as any)[sortField] || "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else if (typeof valueA === "number" && typeof valueB === "number") {
          return direction === "asc" ? valueA - valueB : valueB - valueA;
        }
        return 0;
      });
    };

    // 如果有选择的节点，则优先处理选择的节点
    if (selectedNodes.value.length > 0) {
      console.log("基于选择的节点进行排序");

      // 先对整个树进行排序
      const fullSortedTree = sortTreeData(sortedData);

      // 从排序后的树中提取选择的节点及其子树
      const selectedNodesMap = new Map<string, ProjectNode>();
      selectedNodes.value.forEach((node) => {
        selectedNodesMap.set(node.id, node);
      });

      // 辅助函数：检查节点是否在选中的节点中或是否为选中节点的父节点
      const isSelectedOrParent = (
        node: ProjectNode,
        checkedIds: Set<string>,
      ): boolean => {
        if (checkedIds.has(node.id)) {
          return true;
        }

        if (node.children) {
          return node.children.some((child) =>
            isSelectedOrParent(child, checkedIds),
          );
        }

        return false;
      };

      // 创建新的树结构，优先显示选中的节点
      const newTree: ProjectNode[] = [];
      const remainingNodes: ProjectNode[] = [];

      // 收集选中的节点和剩余节点
      const checkedIds = new Set(selectedNodesMap.keys());
      fullSortedTree.forEach((node) => {
        if (isSelectedOrParent(node, checkedIds)) {
          newTree.push(node);
        } else {
          remainingNodes.push(node);
        }
      });

      // 合并排序后的选中节点和未选中节点
      tableData.value = [...newTree, ...remainingNodes];
    } else {
      // 没有选择节点时，对整个树进行常规排序
      tableData.value = sortTreeData(sortedData);
    }
  };

  // 处理筛选事件
  const handleFilter = (condition: string, direction: "asc" | "desc") => {
    console.log("筛选条件:", condition, "排序方向:", direction);

    // 实际项目中，这里可以调用API进行筛选
    // 例如: await axios.get('/api/wbs/filter', { params: { condition, direction } });

    // 前端筛选实现 - 对表格数据进行排序
    if (!tableData.value.length) return;

    // 复制数据以避免修改原始数据
    const sortedData = JSON.parse(JSON.stringify(tableData.value));

    // 根据条件进行排序
    // 这里仅作示例，实际项目中需要根据实际数据结构和字段名进行调整
    const sortFieldMap: Record<string, string> = {
      task1: "name", // 任务描述1映射到name字段
      task2: "description", // 任务情况总结映射到description字段
      assignee: "assignee", // 任务执行人
      startDate: "startDate", // 开始日期
      endDate: "endDate", // 预计完成日期
      progress: "progress", // 进展
      delay: "isDelayed", // 是否延期
    };

    const sortField = sortFieldMap[condition] || "name";

    // 递归排序树形数据
    const sortTreeData = (data: ProjectNode[]) => {
      // 先对子节点进行排序
      data.forEach((node) => {
        if (node.children && node.children.length > 0) {
          node.children = sortTreeData(node.children);
        }
      });

      // 对当前层级进行排序
      return data.sort((a, b): number => {
        const valueA = (a as any)[sortField] || "";
        const valueB = (b as any)[sortField] || "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else if (typeof valueA === "number" && typeof valueB === "number") {
          return direction === "asc" ? valueA - valueB : valueB - valueA;
        }
        return 0;
      });
    };

    // 应用排序
    tableData.value = sortTreeData(sortedData);
  };

  // 更新字段数据
  const updateField = (
    fieldId: number,
    updatedData: DynamicField & { options?: any[] },
  ) => {
    console.log("更新字段:", fieldId, updatedData);
    const field = fields.value.find((f) => f.id === fieldId);
    if (field) {
      Object.assign(field, updatedData);

      if (
        updatedData.options &&
        (field.type === "radio" || field.type === "multiple")
      ) {
        console.log(`更新字段"${field.name}"的选项，刷新表格数据`);
        // 创建一个新的数组引用
        tableData.value = [...tableData.value];
      }
    }
  };

  // 处理字段重排序事件
  const handleFieldReordered = (reorderedFields: DynamicField[]) => {
    console.log(
      "处理字段重排序:",
      reorderedFields.map((f) => f.name),
    );
    fields.value = [...reorderedFields];
  };

  // 标签页相关处理函数
  const handleTabAdded = (tab: TabItem) => {
    console.log("标签页添加:", tab);
  };

  const handleTabRemoved = (tab: TabItem) => {
    console.log("标签页移除:", tab);
  };

  const handleTabSorted = (tabs: TabItem[]) => {
    console.log("标签页排序:", tabs);
    tabItems.value = tabs;
  };
  const drawerDisplay = ref(false);
  const handleTabActivated = (tabId: number) => {
    console.log("标签页激活:", tabId);
    drawerDisplay.value = tabId !== 1;
  };

  // 处理行高变化事件
  const handleLineHeightChanged = (
    lineHeight: "low" | "medium" | "high" | "ultra-high",
  ) => {
    console.log("行高已变更为:", lineHeight);
    currentLineHeight.value = lineHeight;
  };
  const showAddRecordDialog = ref("0%");
  const handleAddRecordDialog = () => {
    showAddRecordDialog.value = "65%";
    selectedRecord.value = null;
  };
  const closeRecordDialog = () => {
    showAddRecordDialog.value = "0%";
  };
  // 处理字段配置变化
  const handleFieldsChange = (updatedFields: DynamicField[]) => {
    // 更新本地字段配置，确保拖拽后能同步显示
    currentFields.value = JSON.parse(JSON.stringify(updatedFields));
    console.log("字段配置已更新:", updatedFields);
    fields.value = [...updatedFields];
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

  // 提供给所有子孙组件使用
  provide("addRecord", addRecord);
  provide("showFieldConfigPopup", showFieldConfigPopup);
  // 组件挂载时获取字段数据和表格数据
  onMounted(() => {
    fetchFields();
    fetchTableData();
  });

  // 批量操作相关状态
  const selectedRecords = ref<ProjectNode[]>([]);
  const showCLBatchOpToolbar = ref(false);

  const handleShowRecords = (records: ProjectNode[]) => {
    console.log("handleShowRecords", records);
    selectedRecords.value = records;
    showCLBatchOpToolbar.value = records.length > 0;
    showCLBatchOpToolbarGantt.value = records.length > 0;
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
  const selectedRecord = ref<ProjectNode | null>(null);
  const handleShowRecordDetail = (record: ProjectNode) => {
    selectedRecord.value = record;
    showAddRecordDialog.value = "65%";
  };

  const showBatchModifyDialog = ref(false);
  const batchModifyType = ref<"properties" | "type">("properties");
  const targetType = ref("");
  const batchModifyFields = ref<DynamicField[]>([]);

  const handleModifyProperties = () => {
    batchModifyType.value = "properties";
    showBatchModifyDialog.value = true;
    //获取选择数据的字段配置
    batchModifyFields.value = mockFieldsResponse as DynamicField[];
  };

  const handleModifyType = () => {
    batchModifyType.value = "type";
    targetType.value = "任务";
    showBatchModifyDialog.value = true;
  };

  const handleBatchModifyConfirm = (data: any) => {
    console.log("批量修改确认:", data);
    // 这里可以调用API执行批量修改操作
    // 示例：await api.batchModify(data);
    handleBatchModifyClose();
  };

  const handleBatchModifyCancel = () => {
    console.log("批量修改取消");
    handleBatchModifyClose();
  };
  const handleBatchModifyClose = () => {
    showBatchModifyDialog.value = false;
  };
  // 处理更多操作
  const handleMoreAction = (action: string, node: ProjectNode) => {
    console.log("handleMoreAction", action, node);
    if (action === "delete") {
      handleDeleteNode(node);
    } else if (action === "view") {
      handleShowRecordDetail(node);
    } else if (action === "linkDelete") {
      if (clTableRef.value) {
        clTableRef.value.deleteLink(node);
      }
    } else if (action === "change_cell_value") {
      console.log("change_cell_value", node);
      handleShowRecordDetail(node);
    } else if (action === "name") {
      handleShowRecordDetail(node);
    }
  };
</script>

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
  .add-record-dialog-container {
    width: 0;
  }
</style>
<style lang="scss">
  .table-container {
    .el-select__wrapper {
      box-shadow: none !important;
      font-size: 12px;
    }
    .el-select-dropdown__item {
      font-size: 12px;
    }
  }
</style>
