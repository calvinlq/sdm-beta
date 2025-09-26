<template>
  <el-drawer
    v-model="visible"
    resizable
    direction="rtl"
    :size="size"
    :destroy-on-close="true"
    :before-close="handleClose"
    :with-header="false"
    :modal="false"
    :append-to-body="true"
  >
    <el-splitter>
      <el-splitter-panel size="70%" :resizable="false" class="left-panel">
        <div class="drawer-main">
          <!-- 固定头部 -->
          <div class="tabs-header">
            <div class="drawer-title-container">
              <div class="drawer-title">
                <div>
                  <h2 style="font-size: 23px; font-weight: 600">
                    {{ props.record?.name || "未命名任务" }}
                  </h2>
                </div>
                <div class="drawer-title-status">
                  {{ props.record?.status || "未开始" }}
                </div>
              </div>
              <!--显示父记录来源-->
              <div v-if="props.record?.parentRecord" class="parent-record-name">
                父记录:{{ props.record?.parentRecord }}
              </div>
              <!--在这显示获取到的人物头像和名称-->
              <div class="user-info-container">
                <div class="user-info">
                  <div class="avatar-name-cell">
                    <div
                      class="avatar-circle"
                      :style="{ backgroundColor: stringToColor(userName) }"
                    >
                      <span
                        class="avatar-text"
                        :style="{
                          color: pickReadableColor(stringToColor(userName)),
                        }"
                      >
                        {{ shortNameOf(userName) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span class="user-name">{{ userName }}</span>
                    <span class="user-date">{{ beganDate }} 创建</span>
                  </div>
                </div>
                <div class="user-info">
                  <div class="avatar-name-cell">
                    <div
                      class="avatar-circle"
                      :style="{ backgroundColor: stringToColor(userName) }"
                    >
                      <span
                        class="avatar-text"
                        :style="{
                          color: pickReadableColor(stringToColor(userName)),
                        }"
                      >
                        {{ shortNameOf(userName) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span class="user-name">{{ userName }}</span>
                    <span class="user-date">{{ endDate }} 更新</span>
                  </div>
                </div>
              </div>
            </div>
            <CLTabs
              v-model="activeTab"
              :items="computedTabItems"
              :showAddButton="false"
              @tab-activated="handleTabActivated"
            >
              <template #content="{ activeTab: tabItem }"> </template>
            </CLTabs>
          </div>
          <!-- 可滚动内容 -->
          <div class="tab-content-scroll">
            <div v-if="activeTab === 1">
              <div class="details-title">
                <span>描述</span>
                <button class="edit-button" @click="enableEdit">
                  <el-icon><EditPen /></el-icon>
                </button>
              </div>
              <div ref="container">
                <el-input
                  v-model="text"
                  type="textarea"
                  :readonly="isReadonly"
                  :placeholder="props.record?.description || ''"
                  ref="inputRef"
                />
              </div>
              <div>
                <CLTabs
                  v-model="activeTabFooter"
                  :items="UpdatesAndReviews"
                  :showAddButton="false"
                  @tab-activated="handleTabActivated"
                >
                  <template #content="{ activeTab: tabItem }"> </template>
                </CLTabs>
              </div>
            </div>
            <div v-else-if="activeTab === 2">
              <CToolbar
                :fields="props.fields"
                :visibleButtons="toolbarOptions"
                :search-fields="['applicationTitle']"
                @updateFieldVisibility="updateFieldVisibility"
                @updateField="updateField"
                @fieldReordered="handleFieldReordered"
                @lineHeightChanged="handleLineHeightChanged"
                @search="handleSearch"
                @filter="handleFilter"
                @sort="handleSort"
              >
                <template #toolbar-left>
                  <div v-for="button in toolbarButtons" :key="button.key">
                    <el-button :type="button.type" v-if="button.visible">
                      <el-icon v-if="button.icon">
                        <component :is="button.icon" />
                      </el-icon>
                      {{ button.label }}
                    </el-button>
                  </div>
                </template>
              </CToolbar>
              <CLTable
                :fields="props.fields"
                :initial-data="tableData"
                :line-height="currentLineHeight"
                :on-add-node="handleAddNode"
                :on-delete-node="handleDeleteNode"
                :on-update-node="handleUpdateNode"
                :router-fields="routerFields"
                :more-actions="moreActions"
                :tableConfig="tableConfig"
                @update:initial-data=""
                @view-node-detail=""
                @show:records=""
                @node-selected="handleNodeSelected"
                @onMoreAction=""
              />
            </div>
            <div v-else-if="activeTab === 3">
              <CToolbar
                :fields="props.fields"
                :visibleButtons="toolbarOptions"
                :search-fields="['applicationTitle']"
                @updateFieldVisibility="updateFieldVisibility"
                @updateField="updateField"
                @fieldReordered="handleFieldReordered"
                @lineHeightChanged="handleLineHeightChanged"
                @search="handleSearch"
                @filter="handleFilter"
                @sort="handleSort"
              >
                <template #toolbar-left>
                  <div v-for="button in toolbarButtons" :key="button.key">
                    <el-button :type="button.type" v-if="button.visible">
                      <el-icon v-if="button.icon">
                        <component :is="button.icon" />
                      </el-icon>
                      {{ button.label }}
                    </el-button>
                  </div>
                </template>
              </CToolbar>
              <CLTable
                :fields="props.fields"
                :initial-data="tableData"
                :line-height="currentLineHeight"
                :on-add-node="handleAddNode"
                :on-delete-node="handleDeleteNode"
                :on-update-node="handleUpdateNode"
                :router-fields="routerFields"
                :more-actions="moreActions"
                :tableConfig="tableConfig"
                @update:initial-data=""
                @view-node-detail=""
                @show:records=""
                @node-selected="handleNodeSelected"
                @onMoreAction=""
              />
            </div>
            <div v-else-if="activeTab === 4">
              <CToolbar
                :fields="props.fields"
                :visibleButtons="toolbarOptions"
                :search-fields="['applicationTitle']"
                @updateFieldVisibility="updateFieldVisibility"
                @updateField="updateField"
                @fieldReordered="handleFieldReordered"
                @lineHeightChanged="handleLineHeightChanged"
                @search="handleSearch"
                @filter="handleFilter"
                @sort="handleSort"
              >
                <template #toolbar-left>
                  <div v-for="button in toolbarButtons" :key="button.key">
                    <el-button :type="button.type" v-if="button.visible">
                      <el-icon v-if="button.icon">
                        <component :is="button.icon" />
                      </el-icon>
                      {{ button.label }}
                    </el-button>
                  </div>
                </template>
              </CToolbar>
              <CLTable
                :fields="props.fields"
                :initial-data="tableData"
                :line-height="currentLineHeight"
                :on-add-node="handleAddNode"
                :on-delete-node="handleDeleteNode"
                :on-update-node="handleUpdateNode"
                :router-fields="routerFields"
                :more-actions="moreActions"
                :tableConfig="tableConfig"
                @update:initial-data=""
                @view-node-detail=""
                @show:records=""
                @node-selected="handleNodeSelected"
                @onMoreAction=""
              />
            </div>
          </div>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="380" class="right-panel">
        <div class="right-container">
          <h2 class="right-header">任务信息</h2>
          <FormTabDetails
            v-if="activeTab === 1"
            :formData="formData"
            :describe="formData.describe || ''"
            :computedFields="props.fields"
            @close="close"
            @update:data="updateFormData"
          />
        </div>
      </el-splitter-panel>
    </el-splitter>

    <!-- 左侧菜单 -->
    <div class="left-menu-container left-menu">
      <div
        v-if="size === '0%'"
        class="menu-item info-icon"
        @click="handleInfoClick"
        title="展开详情"
      >
        <img src="../assets/arrowLeft.svg" alt="" />
      </div>
      <div
        v-else
        class="menu-item info-icon"
        @click="closeInfoClick"
        title="收起详情"
      >
        <el-icon><DArrowRight /></el-icon>
      </div>
      <div class="menu-item add-icon" @click="handleInfoClick" title="添加">
        <img src="../assets/image%2021.svg" alt="" />
      </div>
      <div class="menu-item remove-icon" @click="handleInfoClick" title="删除">
        <img src="../assets/image%2068.svg" alt="" />
      </div>
      <div class="menu-item remove-icon" @click="handleInfoClick" title="删除">
        <img src="../assets/image%2023.svg" alt="" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  import {
    ref,
    watch,
    onMounted,
    computed,
    nextTick,
    onBeforeUnmount,
  } from "vue";
  import { ElIcon, type FormInstance } from "element-plus";
  import {
    type DynamicField,
    type SoftwareField,
    type SoftwareNode,
    type TabItem,
    type ToolbarButton,
    type ToolbarProps,
  } from "@/data/wbsFields.ts";
  import { type ProjectNode, projectSampleData } from "@/data/wbsData.ts";
  import CLTabs from "@/components/CLTabs.vue";
  import { otherIcon } from "@/utils/SvgIcons.ts";
  import FormTabDetails from "@/components/FormTabDetails.vue";
  import CLTable from "@/components/CLTable/index.vue";
  import CToolbar from "@/components/CToolbar.vue";
  import {
    DArrowRight,
    Delete,
    Download,
    EditPen,
    Upload,
  } from "@element-plus/icons-vue";

  interface Props {
    size: string;
    fields: DynamicField[] | SoftwareField[];
    record?: ProjectNode | SoftwareNode | null;
    mode?: string;
    routerFields?: string[];
  }
  // 工具函数：获取名字首字母或中文姓氏
  function shortNameOf(name: string) {
    if (!name) return "?";
    return name[0].toUpperCase();
  }

  // 工具函数：根据名字生成颜色
  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 60%, 70%)`;
    return color;
  }

  // 工具函数：根据背景色选择可读文字颜色
  function pickReadableColor(bgColor: string) {
    // 简单方案：如果亮度太高就用黑色，否则白色
    const rgb = bgColor.match(/\d+/g)?.map(Number) || [200, 200, 200];
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 155 ? "#000" : "#fff";
  }
  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: "close:size"): void;
    (e: "update:formData", data: ProjectNode[] | SoftwareNode[] | null): void;
  }>();
  // 内部可见性
  const visible = ref(true);
  const size = ref(props.size);
  const formData = ref<Record<string, any>>({});
  const tableData = ref<ProjectNode[]>([]);
  const formRef = ref<FormInstance>();
  const wbsFields = ref<DynamicField[]>([]);
  const wbsData = ref<ProjectNode[]>([]);
  const activeTab = ref<number>(1);
  const activeTabFooter = ref<number>(1);
  const text = ref("");
  const isReadonly = ref(true);
  const container = ref<HTMLElement | null>(null);
  const inputRef = ref();
  const UpdatesAndReviews = computed<TabItem[]>(() => {
    return [
      {
        id: 1,
        title: "动态",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 2,
        title: "评论",
        icon: otherIcon,
        closable: false,
      },
    ];
  });
  const computedTabItems = computed<TabItem[]>(() => {
    console.log("computedTabItems", props.record);
    // 如果 record 为空，只显示详情标签页
    if (!props.record?.name || "image" in props.record) {
      return [
        {
          id: 1,
          title: "详情",
          icon: otherIcon,
          closable: false,
        },
      ];
    }
    return [
      {
        id: 1,
        title: "详情",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 2,
        title: "输入数据",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 3,
        title: "过程数据",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 4,
        title: "输出数据",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 5,
        title: "交付物",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 6,
        title: "子项",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 7,
        title: "相关任务",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 8,
        title: "参考资料",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 9,
        title: "动态",
        icon: otherIcon,
        closable: false,
      },
      {
        id: 10,
        title: "评论",
        icon: otherIcon,
        closable: false,
      },
    ];
  });

  const describe = ref<string | null>(null);
  const routerFields = ref(["applicationTitle"]);
  const moreActions = ref([
    // { key: "visit", label: "访问项目" },
    // { key: "favorite", label: "收藏项目" },
    { key: "view", label: "查看" },
    { key: "edit", label: "编辑" },
    // { key: "setting", label: "项目设置" },
    { key: "delete", label: "删除" },
    // { key: "recycle", label: "回收站" },
  ]);
  const userName = ref("");
  const beganDate = ref("");
  const endDate = ref("");
  const tableConfig = ref({
    showOperationsColumn: true, // 是否显示操作列
    OperationsColumnMode: "text", // 操作列模式，text为文本模式
    OperationsColumnWidth: 150, //自定义操作列宽度
    frozenColCount: 3, // 冻结前面列数
    rightFrozenColCount: 1, // 冻结后面列数
    // tree: true,  // 开启树形结构
    // rowSeriesNumber: {
    //   dragOrder: true,  // 开启行号拖拽排序
    // },
  });
  const toolbarOptions = ref({
    add: {
      name: "新建节点",
      enable: true,
    },
  });
  const selectedNodes = ref<ProjectNode[]>([]);
  //配置事件和日期字段显示
  const fieldSettings = () => {
    const [
      userField = "assignee",
      startField = "startDate",
      endField = "endDate",
    ] = props.routerFields ?? [];
    userName.value =
      props.record?.[userField] && props.record?.[userField] !== ""
        ? props.record?.[userField]
        : "—";
    beganDate.value =
      props.record?.[startField] && props.record?.[startField] !== ""
        ? props.record?.[startField]
        : "—";
    endDate.value =
      props.record?.[endField] && props.record?.[endField] !== ""
        ? props.record?.[endField]
        : "—";
  };

  const handleClose = (done: () => void) => {
    close();
    done();
  };
  watch(
    () => props.size,
    (newVal) => {
      size.value = newVal;
    },
  );
  const close = () => {
    formData.value = {};
    wbsData.value = [];
    wbsFields.value = [];
    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields();
    }
    emit("close:size");
  };
  const handleTabActivated = (tabId: number) => {
    console.log("标签页激活:", tabId);
  };
  const handleInfoClick = () => {
    console.log("查看详细信息");
    size.value = "65%";
  };
  const closeInfoClick = () => {
    console.log("关闭详细信息");
    size.value = "0%";
    emit("close:size");
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
  const currentLineHeight = ref<"low" | "medium" | "high" | "ultra-high">(
    "low",
  );

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
  const updateFormData = (data: ProjectNode[] | SoftwareNode[] | null) => {
    console.log("表单数据更新111:", data);
    emit("update:formData", data);
  };
  // 更新字段可见性状态
  const updateFieldVisibility = (fieldId: number, invisible: boolean) => {
    const field = props.fields.find((f) => f.id === fieldId);
    if (field) {
      field.invisible = invisible;
    }
  };
  // 更新字段数据
  const updateField = (
    fieldId: number,
    updatedData: DynamicField & { options?: any[] },
  ) => {
    console.log("更新字段:", fieldId, updatedData);
    const field = props.fields.find((f) => f.id === fieldId);
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
    props.fields = [...reorderedFields];
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
  // 处理行高变化事件
  const handleLineHeightChanged = (
    lineHeight: "low" | "medium" | "high" | "ultra-high",
  ) => {
    console.log("行高已变更为:", lineHeight);
    currentLineHeight.value = lineHeight;
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
  // 处理节点选择事件
  const handleNodeSelected = (nodes: ProjectNode[]) => {
    selectedNodes.value = nodes;
  };
  onMounted(() => {
    fetchTableData();
    fieldSettings();
    document.addEventListener("click", handleClickOutside);
  });
  // 如果传入了record，则初始化表单数据
  watch(
    () => props.record,
    (record) => {
      fieldSettings();
      if (record) {
        // 根据record初始化表单数据
        const newRecord = { ...record };
        props.fields.forEach((field) => {
          if (field.type === "checkbox") {
            if (
              !newRecord[field.field] ||
              typeof newRecord[field.field] !== "object"
            ) {
              newRecord[field.field] = {
                text: "是",
                checked: !!newRecord[field.field],
                disable: false,
              };
            } else {
              newRecord[field.field] = {
                text: newRecord[field.field].text || "是",
                checked: newRecord[field.field].checked || false,
                disable: newRecord[field.field].disable || false,
              };
            }
          }
        });
        formData.value = { ...newRecord };
        describe.value = newRecord.description || null;
      }
    },
    { immediate: true },
  );
  const tabToolbarConfig = {
    1: {
      // 详情标签
      import: false,
      export: false,
      batchDelete: false,
      checkIn: false,
      checkOut: false,
      delete: false,
      submit: false,
      openWorkDir: false,
      checkInFileSettings: false,
      association: false,
      edit: false,
      unAssociation: false,
    },
    2: {
      // 输入数据标签
      import: true,
      export: true,
      batchDelete: true,
      checkIn: false,
      checkOut: false,
      delete: true,
      submit: false,
      openWorkDir: false,
      checkInFileSettings: false,
      association: true,
      edit: true,
      unAssociation: true,
    },
    3: {
      // 过程数据标签
      import: false,
      export: true,
      batchDelete: false,
      checkIn: false,
      checkOut: false,
      delete: false,
      submit: false,
      openWorkDir: false,
      checkInFileSettings: false,
      association: false,
      edit: false,
      unAssociation: false,
    },
    4: {
      // 输出数据标签
      import: false,
      export: true,
      batchDelete: false,
      checkIn: true,
      checkOut: true,
      delete: true,
      submit: true,
      openWorkDir: true,
      checkInFileSettings: true,
      association: false,
      edit: false,
      unAssociation: false,
    },
    // 可以为其他标签页添加配置
  } as const;
  const manualToolbarConfig = ref<ToolbarProps | null>(null);
  const currentToolbarConfig = computed((): ToolbarProps => {
    // 如果有手动设置的配置，使用手动配置
    if (manualToolbarConfig.value) {
      return manualToolbarConfig.value;
    }
    // 否则根据当前标签页返回对应配置
    const config =
      tabToolbarConfig[activeTab.value as keyof typeof tabToolbarConfig];
    return config || tabToolbarConfig[2]; // 默认使用输入数据标签的配置
  });
  // 工具栏按钮定义
  const toolbarButtons = computed((): ToolbarButton[] => {
    const config = currentToolbarConfig.value;
    return [
      {
        key: "import",
        label: "导入",
        type: undefined,
        icon: Upload,
        handler: handleImport,
        visible: config.import !== false,
      },
      {
        key: "association",
        label: "关联",
        type: undefined,
        icon: undefined,
        handler: handleBatchDelete,
        visible: config.association !== false,
      },
      {
        key: "export",
        label: "导出",
        type: undefined,
        icon: Download,
        handler: handleExport,
        visible: config.export !== false,
      },
      {
        key: "unAssociation",
        label: "取消关联",
        type: undefined,
        icon: undefined,
        handler: handleBatchDelete,
        visible: config.unAssociation !== false,
      },
      {
        key: "edit",
        label: "编辑",
        type: undefined,
        icon: EditPen,
        handler: handleBatchDelete,
        visible: config.edit !== false,
      },
      {
        key: "batchDelete",
        label: "批量删除",
        type: undefined,
        icon: Delete,
        handler: handleBatchDelete,
        visible: config.batchDelete !== false,
      },
      {
        key: "checkIn",
        label: "检入",
        type: undefined,
        icon: undefined,
        handler: handleBatchDelete,
        visible: config.checkIn !== false,
      },
      {
        key: "checkOut",
        label: "检出",
        type: undefined,
        icon: undefined,
        handler: handleBatchDelete,
        visible: config.checkOut !== false,
      },
      {
        key: "delete",
        label: "删除",
        type: undefined,
        icon: undefined,
        handler: handleBatchDelete,
        visible: config.delete !== false,
      },
      {
        key: "submit",
        label: "提交HPC计算",
        type: undefined,
        icon: undefined,
        handler: handleSubmit,
        visible: config.submit !== false,
      },
    ];
  });
  // 重置为标签页默认配置
  const resetToolbarConfig = () => {
    manualToolbarConfig.value = null;
  };

  // 监听标签页变化，重置手动配置
  watch(activeTab, () => {
    // 可选：当切换标签页时自动重置手动配置
    resetToolbarConfig();
  });

  const openAddRecordDialog = () => {
    // 实现新建节点逻辑
    console.log("新建节点");
  };

  const handleImport = () => {
    // 实现导入逻辑
    console.log("导入");
  };

  const handleExport = () => {
    // 实现导出逻辑
    console.log("导出");
  };

  const handleBatchDelete = () => {
    // 实现批量删除逻辑
    console.log("批量删除");
  };

  const handleSubmit = () => {
    // 实现提交HPC计算逻辑
    console.log("提交HPC计算");
  };
  // 点击按钮使可编辑
  const enableEdit = async () => {
    isReadonly.value = false;
    await nextTick();
    inputRef.value?.focus();
  };

  // 点击外部区域恢复只读
  const handleClickOutside = (e: MouseEvent) => {
    if (container.value && !container.value.contains(e.target as Node)) {
      isReadonly.value = true;
    }
  };
  onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped lang="scss">
  .drawer-main {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden; // 整体不滚动
  }

  .tabs-header {
    flex-shrink: 0; // 固定高度，不缩放
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  }

  .drawer-title {
    display: flex;
    flex-direction: row;
    height: 22px;
    align-items: center;
    gap: 10px;
    padding: 26px 0 20px 0;
  }

  .drawer-title-text {
    font-size: 12px;
    font-weight: 400;
  }

  .tab-content-scroll {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  }

  .form-body {
    padding-right: 10px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .left-menu-container {
    position: absolute;
    left: -50px;
    top: 400px;
    bottom: 0;
    width: 40px;
    background-color: #ffffff;
    border-right: 1px solid #dcdfe6;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: -10px 0px 16px rgba(0, 0, 0, 0.06);
  }

  .left-menu {
    width: 50px;
    height: 155px;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 40%;
  }

  .menu-item {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
    transition: all 0.3s ease;
    cursor: pointer;
    color: #909399;
    border: 1px solid transparent;
  }

  .tab-content-scroll {
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .tab-content-scroll::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  .user-info-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .user-name {
    font-size: 12px;
    font-weight: 400;
    padding-left: 5px;
  }
  .user-date {
    margin-left: 10px;
    font-size: 12px;
    font-weight: 400;
  }
  .drawer-btns {
    margin-bottom: 10px;
  }
  .drawer-title-status {
    background-color: #ffeee3;
    font-size: 13px;
    font-weight: 400;
    color: #be5a00;
    height: 20px;
    width: 50px;
    padding: 2px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    font-weight: 500;
    font-size: 12px;
  }
  .avatar-text {
    display: inline-block;
    text-align: center;
  }
  .avatar-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .parent-record-name {
    font-size: 14px;
    font-weight: 500;
    padding: 0 0 10px 10px;
  }
  .right-header {
    margin: 0;
    padding: 24px 0 0 24px;
    font-size: 14px;
    font-weight: 500;
  }
  .details-title {
    display: flex;
    align-items: center;
    margin: 20px 10px;
    gap: 6px;
  }
  .edit-button {
    border: none;
    cursor: pointer;
    background-color: #fff;
    padding-top: 5px;
  }
</style>
<style lang="scss">
  .is-drawer {
    position: static !important;
  }
  .el-drawer__body {
    padding: 0 !important;
  }
  .right-panel {
    background-color: #f8f8f8;
  }
  .left-panel {
    padding: 5px 10px;
  }
</style>
