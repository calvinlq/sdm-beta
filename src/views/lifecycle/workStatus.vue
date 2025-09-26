<template>
  <div>
    <CToolbar
      :fields="fields"
      :visibleButtons="toolbarOptions"
      @openAddRecordDialog="handleAddLifecycleStatus"
    ></CToolbar>
    <CLTable
      v-loading="loading"
      :fields="fields"
      :initial-data="tableData"
      :line-height="currentLineHeight"
      :more-actions="moreActions"
      :tableConfig="tableConfig"
      @node-selected="handleNodeSelected"
      @onMoreAction="handleMoreAction"
    >
    </CLTable>
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
      @handleDialogOk="handleCreateOrEdit"
      :fields="dialogFields"
      :nodeData="selectedNode"
    ></CDialog>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, provide, onMounted } from "vue";
  import CLTable from "@/components/CLTable/index.vue";
  import CToolbar from "@/components/CToolbar.vue";
  import CDialog from "@/components/CDialog.vue";
  import {
    type DynamicField,
    mockCreateFieldsLifecycleStatus,
    mockFieldsLifecycleStatus,
  } from "@/data/wbsFields.ts";
  import { ElMessageBox, ElMessage } from "element-plus";
  import type {
    createOrEditLifecycleStatusParams,
    LifeGlobalStatusVo,
    listLifeCycleParams,
    listLifeCycleStatusParams,
    Value,
  } from "@/interface/lifecycle.ts";
  import {
    createLifeGlobalStatus,
    listLifeGlobalStatus,
    getLifecycleFieldList,
    deleteLifeGlobalStatus,
    editLifeGlobalStatus,
  } from "@/api/lifeCycle.ts";

  // 工具栏选项
  const toolbarOptions = ref({
    add: {
      name: "新增",
      enable: true,
    },
    fieldConfig: false,
    filter: false,
    sort: false,
    lineHeight: false,
    help: false,
    log: false,
    export: false,
  });
  const fields = ref<DynamicField[]>([]);
  const loading = ref<boolean>(false);
  const tableData = ref<LifeGlobalStatusVo[]>([]);
  // 当前行高设置
  const currentLineHeight = ref<"low" | "medium" | "high" | "ultra-high">(
    "low",
  );
  const moreActions = ref([
    { key: "edit", label: "编辑" },
    { key: "delete", label: "删除" },
  ]);
  const tableConfig = ref({
    editable: true,
    showOperationsColumn: true, // 是否显示操作列
    OperationsColumnMode: "text", // 操作列模式，text为文本模式
    OperationsColumnWidth: 50, //自定义操作列宽度
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
  const tableListQuery = reactive<listLifeCycleStatusParams>({
    pageNo: 1,
    pageSize: 20,
    sortParams: [],
    conditions: [],
    logic: "",
  }); // table列表请求参数
  const totals = ref(0);
  const operate = ref<string>("create");
  const dialogVisible = ref<boolean>(false);
  const dialogFields = ref<DynamicField[]>([]);
  const fieldsList = ref<Value[]>([]);
  const selectedNode = ref({});
  // dialogFields.value = mockCreateFieldsLifecycleStatus;

  const getFields = async () => {
    fields.value = mockFieldsLifecycleStatus;
    await getLifecycleField();
    dialogFields.value = mockCreateFieldsLifecycleStatus.map((item) => {
      if (item.field === "code") {
        item.options = fieldsList.value.map((item) => {
          return {
            label: item.displayName,
            value: item.code,
          };
        });
      }
      return item;
    });
    console.log(fieldsList.value, "fieldsList");
  };
  // 处理节点选择事件
  const handleNodeSelected = (nodes: LifeGlobalStatusVo[]) => {
    // selectedNodes.value = nodes;
    console.log("handleNodeSelected", nodes);
  };
  const handleAddLifecycleStatus = () => {
    operate.value = "create";
    dialogVisible.value = true;
  };
  const handleMoreAction = (action: string, index: number) => {
    const node = tableData.value[index - 1];
    console.log("handleMoreAction", action, node);
    if (action === "edit") {
      selectedNode.value = node;
      dialogVisible.value = true;
      operate.value = "edit";
    } else if (action === "delete") {
      ElMessageBox.confirm("确定删除该类型?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true,
      })
        .then(async () => {
          await deleteLifeGlobalStatus(node.id!);
          ElMessage({
            type: "success",
            message: "删除成功",
          });
          getTableList();
        })
        .catch(() => {});
    }
  };
  const handleSizeChange = (size: number) => {
    tableListQuery.pageSize = size;
    getTableList();
  };
  const handleCurrentChange = (pageNo: number) => {
    tableListQuery.pageNo = pageNo;
    getTableList();
  };
  // 显示字段配置弹窗
  const showFieldConfigPopup = (position: { left: number; top: number }) => {
    // fieldConfigPosition.value = position;
    // currentFields.value = JSON.parse(JSON.stringify(fields.value || []));
    // setTimeout(() => {
    //   showFieldConfig.value = !showFieldConfig.value;
    // }, 100);
  };
  provide("showFieldConfigPopup", showFieldConfigPopup);

  const getTableList = async () => {
    loading.value = true;
    const res = await listLifeGlobalStatus(tableListQuery);
    totals.value = res.total || 0;
    tableData.value =
      res.result.map((item) => {
        item.name = item.name.zh_CN;
        return item;
      }) || [];
    loading.value = false;
  };
  const handleCreateOrEdit = async (formData: Record<string, any>) => {
    console.log("formData", formData);
    const params: createOrEditLifecycleStatusParams = {
      id: formData.id,
      icon: formData.icon,
      code: formData.code,
      name: {
        zh_CN: formData.name,
        en_US: "test test",
      },
      color: formData.color,
    };
    if (operate.value === "create") {
      await createLifeGlobalStatus(params);
      ElMessage({
        type: "success",
        message: "新建成功",
      });
      dialogVisible.value = false;
      getTableList();
    } else if (operate.value === "edit") {
      await editLifeGlobalStatus(params);
      ElMessage({
        type: "success",
        message: "修改成功",
      });
      dialogVisible.value = false;
      getTableList();
    }
  };
  const getLifecycleField = async () => {
    const res = await getLifecycleFieldList();
    // console.log(res.find((item) => item.code === "status"));
    fieldsList.value = res.find((item) => item.code === "STATUS")?.values || [];
    console.log(fieldsList.value, "fieldsList.value");
  };
  onMounted(() => {
    getFields();
    getTableList();
  });
</script>

<style scoped lang="scss"></style>
