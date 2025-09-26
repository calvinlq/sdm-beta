<template>
  <div class="container">
    <div class="breadCrumb">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/' }">任务类型</el-breadcrumb-item>
        <el-breadcrumb-item>力学仿真</el-breadcrumb-item>
        <el-breadcrumb-item>配置类型</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
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
          <CToolbar
            :fields="fields"
            :visible-buttons="toolbarOptions"
            @openAddRecordDialog="handleAddRecordDialog"
          >
            <template #toolbar-left>
              <button class="toolbar-btn" @click="handleEditRecordDialog">
                <el-icon><Edit /></el-icon>编辑
              </button>
              <button class="toolbar-btn" @click="handleDeleteRecordDialog">
                <el-icon><Delete /></el-icon>删除
              </button>
              <button class="toolbar-btn">
                <el-icon><Tools /></el-icon>检入文件设置
              </button>
            </template>
            <template #toolbar-right-after>
              <button class="toolbar-btn" @click="handleCardView">
                <el-icon><Menu /></el-icon>卡片
              </button>
              <button class="toolbar-btn" @click="handleListView">
                <el-icon><List /></el-icon>列表
              </button>
            </template>
          </CToolbar>
          <UseSoftware
            :change-view="viewType"
            :fields="softwareFields"
            :software-data="tableData"
            @selection-change="handleSelectionChange"
            @selection-view="handleRowView"
          ></UseSoftware>
        </div>
      </template>
    </CLTabs>
  </div>
  <AddRecordDialog
    :size="showAddRecordDialog"
    :fields="softwareFields"
    :record="selectedSoftware"
    :routerFields="dialogRouterFields"
    @close:size="closeRecordDialog"
  >
  </AddRecordDialog>
</template>

<script setup lang="ts">
  import {
    ArrowRight,
    Delete,
    Edit,
    List,
    Menu,
    Tools,
  } from "@element-plus/icons-vue";
  import CLTabs from "@/components/CLTabs.vue";
  import { onMounted, ref } from "vue";
  import {
    mockFieldsSoftwareField,
    type SoftwareField,
    type SoftwareNode,
    type TabItem,
  } from "@/data/wbsFields.ts";
  import { tableIcon } from "@/utils/SvgIcons.js";
  import CToolbar from "@/components/CToolbar.vue";
  import type { FormItemRule } from "element-plus";
  import UseSoftware from "@/views/pm/ConfigurationType/UseSoftware.vue";
  import { mockSoftwareFields } from "@/data/wbsData.ts";
  import AddRecordDialog from "@/components/AddRecordDialog.vue";
  interface DynamicField {
    id: number;
    name: string;
    field: string;
    type: string;
    invisible: boolean;
    options?: Array<{ value: string; label: string; tag?: string }>;
    rules?: FormItemRule[];
  }
  const activeTab = ref<number>(1);
  const tabItems = ref<TabItem[]>([
    {
      id: 1,
      title: "生命周期/审批",
      icon: tableIcon,
      closable: false,
    },
    {
      id: 2,
      title: "任务字段",
      icon: tableIcon,
      closable: false,
    },
    {
      id: 3,
      title: "使用软件",
      icon: tableIcon,
      closable: false,
    },
  ]);
  const fields = ref<DynamicField[]>([]);
  const toolbarOptions = ref({
    add: {
      name: "新建",
      enable: true,
    },
  });
  const viewType = ref(false);
  const softwareFields = ref<SoftwareField[]>([]);
  const tableData = ref<SoftwareNode[]>([]);
  const dialogRouterFields = ref(["creator", "creatorTime"]);
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

  const handleTabActivated = (tabId: number) => {
    console.log("标签页激活:", tabId);
  };
  const handleCardView = () => {
    console.log("切换到卡片视图");
    viewType.value = true;
    // 实现卡片视图逻辑
  };

  const handleListView = () => {
    console.log("切换到列表视图");
    viewType.value = false;
    // 实现列表视图逻辑
  };
  const fetchFields = async () => {
    try {
      // 这里应该是实际的API调用，例如：
      // const response = await axios.get('/api/wbs/fields');
      // fields.value = response.data;

      // 模拟API调用，使用外部引入的数据
      // 实际项目中请替换为真实的API请求

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      softwareFields.value = mockFieldsSoftwareField;
    } catch (error) {
      console.error("获取字段数据失败:", error);
      // 可以在这里设置默认数据作为后备
    }
  };
  const fetchTableData = async () => {
    try {
      // 这里应该是实际的API调用，例如：
      // const response = await axios.get('/api/wbs/data');
      // tableData.value = response.data;

      // 模拟API调用，使用外部引入的数据
      // 实际项目中请替换为真实的API请求

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      tableData.value = JSON.parse(JSON.stringify(mockSoftwareFields));
    } catch (error) {
      console.error("获取表格数据失败:", error);
    }
  };
  const selectedSoftware = ref<SoftwareNode | undefined>();

  const handleSelectionChange = (selectedData: SoftwareNode | undefined) => {
    selectedSoftware.value = selectedData;
    console.log("当前选中的软件数据:", selectedData);
    // 在这里可以执行其他操作，比如：
    // - 保存选中数据到状态管理
    // - 发送选中数据到后端
    // - 更新UI显示等
  };

  const showAddRecordDialog = ref("0%");
  const closeRecordDialog = () => {
    showAddRecordDialog.value = "0%";
  };
  const handleEditRecordDialog = () => {
    console.log("编辑软件数据");
    if (!selectedSoftware.value) {
      return;
    }
    showAddRecordDialog.value = "50%";
  };
  const handleDeleteRecordDialog = () => {
    console.log("删除软件数据");
    if (!selectedSoftware.value) return;
    //删除tableData中的selectedSoftware这条数据
    tableData.value = tableData.value.filter(
      (item) => item.id !== selectedSoftware?.value.id,
    );
  };
  const handleRowView = (row: SoftwareNode) => {
    console.log("查看软件数据:", row);
    selectedSoftware.value = row;
    showAddRecordDialog.value = "50%";
  };
  const handleAddRecordDialog = () => {
    console.log("添加软件数据");
    showAddRecordDialog.value = "50%";
    selectedSoftware.value = undefined;
  };
  onMounted(() => {
    fetchFields();
    fetchTableData();
  });
</script>
<style scoped lang="scss">
  .container {
    height: 100vh;
    margin: 10px;
    border: 1px solid #eee;
  }
  :deep(.el-breadcrumb) {
    font-size: 22px;
  }
  .breadCrumb {
    padding: 10px;
  }
  .toolbar-btn {
    border: none;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #646a73;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;

    .icon {
      font-size: 16px;
    }

    &:hover {
      color: #1890ff;
      border-color: #1890ff;
      background: #e6f7ff;
    }

    &.active {
      color: #1890ff;
      border-color: #1890ff;
      background: #e6f7ff;
    }
  }
</style>
