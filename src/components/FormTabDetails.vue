<template>
  <div class="form-container">
    <el-form
      :model="props.formData"
      ref="formRef"
      label-width="100px"
      class="form-body"
    >
      <template v-for="field in props.computedFields" :key="field.id">
        <el-form-item
          :label="field.name"
          :prop="field.field"
          :rules="field.rules"
        >
          <!-- 父记录选择 -->
          <div
            v-if="field.field === 'parentRecord'"
            class="parent-record-selector"
          >
            <el-button
              type="primary"
              link
              class="parent-record-button"
              @click="openParentSelector"
            >
              {{ props.formData[field.field] || `请选择${field.name}` }}
            </el-button>
          </div>

          <!-- 文本输入 -->
          <el-input
            v-else-if="field.type === 'text'"
            v-model="props.formData[field.field]"
            :placeholder="`请输入${field.name}`"
            class="el-items"
          />

          <!-- 下拉选择 -->
          <el-select
            v-else-if="
              field.type === 'radio' ||
              field.type === 'multiple' ||
              field.type === 'select'
            "
            v-model="props.formData[field.field]"
            :multiple="field.type === 'multiple'"
            :placeholder="`请选择${field.name}`"
            style="width: 100%"
            class="el-items"
          >
            <el-option
              v-for="opt in field.options || []"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <!-- 时间范围 -->
          <el-date-picker
            v-else-if="
              field.field === 'actualDate' || field.field === 'plannedDate'
            "
            v-model="props.formData[field.field]"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
            style="width: 100%"
            class="el-items"
          />

          <!-- 日期 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="props.formData[field.field]"
            type="date"
            :placeholder="`请选择${field.name}`"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
            style="width: 100%"
            class="el-items"
          />

          <!-- 用户选择 -->
          <el-select
            v-else-if="field.type === 'user'"
            v-model="props.formData[field.field]"
            placeholder="请选择用户"
            style="width: 100%"
            class="el-items"
          >
            <el-option
              v-for="(avater, name) in assigneeAvatars || []"
              :key="name"
              :label="name"
              :value="name"
            >
              {{ avater }} {{ name }}
            </el-option>
          </el-select>

          <!-- 复选框 -->
          <el-checkbox
            v-else-if="field.type === 'checkbox'"
            :model-value="getCheckboxValue(field.field)"
            class="el-items"
            @change="(val) => handleCheckboxChange(field.field, val)"
          >
            {{ getCheckboxText(field.field) }}
          </el-checkbox>

          <!-- 自定义函数 fn -->
          <el-input
            v-else-if="field.type === 'fn'"
            v-model="props.formData[field.field]"
            type="textarea"
            :rows="3"
            placeholder="请输入函数表达式"
            class="el-items"
          />

          <!-- 开关 -->
          <el-switch
            v-else-if="field.type === 'switch'"
            v-model="props.formData[field.field]"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #eae4e4;
            "
          />

          <!-- 默认兜底 -->
          <el-input
            class="el-items"
            v-else
            v-model="props.formData[field.field]"
            :placeholder="`请输入${field.name}`"
          />
        </el-form-item>
      </template>
    </el-form>
  </div>
  <!-- 父记录选择弹窗 -->
  <el-dialog
    v-model="parentSelectorVisible"
    title="选择父记录"
    width="80%"
    top="5vh"
    class="parent-selector-dialog"
  >
    <div class="parent-selector-content">
   
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="parentSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmParentSelection"
          >确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, ref, watch } from "vue";
  import type { FormInstance, FormRules } from "element-plus";
  import {
    assigneeAvatars,
    type ProjectNode,
    wbsSampleData,
  } from "@/data/wbsData.ts";
  import {
    type DynamicField,
    mockFieldsResponse,
    type SoftwareNode,
  } from "@/data/wbsFields.ts";

  const props = defineProps<{
    formData: Record<string, any>;
    describe: string;
    computedFields: DynamicField[];
  }>();

  const parentSelectorVisible = ref(false);
  const formRef = ref<FormInstance>();
  const selectedParent = ref<any>(null);
  const wbsFields = ref<DynamicField[]>([]);
  const wbsData = ref<ProjectNode[]>([]);
  const addRecord = inject<(_: ProjectNode[]) => void>("addRecord");

  const fetchFields = async () => {
    try {
      // 这里应该是实际的API调用，例如：
      // const response = await axios.get('/api/wbs/fields');
      // fields.value = response.data;

      // 模拟API调用，使用外部引入的数据
      // 实际项目中请替换为真实的API请求

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      wbsFields.value = mockFieldsResponse;
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
      wbsData.value = JSON.parse(JSON.stringify(wbsSampleData));
    } catch (error) {
      console.error("获取表格数据失败:", error);
    }
  };
  const openParentSelector = () => {
    parentSelectorVisible.value = true;
  };
  const handleParentSelect = (row: any) => {
    selectedParent.value = row;
  };
  // 确认父记录选择
  const confirmParentSelection = () => {
    if (selectedParent.value) {
      props.formData.parentRecord = selectedParent.value.name;
    }
    parentSelectorVisible.value = false;
  };
  const handleCheckboxChange = (field: string, value: boolean) => {
    if (!props.formData[field]) {
      props.formData[field] = { text: "是", checked: false, disable: false };
    }
    props.formData[field].checked = value;
  };
  const getCheckboxValue = (fieldKey: string) => {
    const fieldData = props.formData[fieldKey];
    if (
      fieldData &&
      typeof fieldData === "object" &&
      fieldData.checked !== undefined
    ) {
      return fieldData.checked;
    }
    return false; // 默认值
  };

  // 获取复选框的文本
  const getCheckboxText = (fieldKey: string) => {
    const fieldData = props.formData[fieldKey];
    if (fieldData && typeof fieldData === "object" && fieldData.text) {
      return fieldData.text;
    }
    return "是"; // 默认文本
  };

  // 校验规则
  const rules = computed<FormRules>(() => ({
    name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
    priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
    status: [{ required: true, message: "请选择状态", trigger: "change" }],
    startDate: [
      { required: true, message: "请选择开始时间", trigger: "change" },
    ],
    endDate: [{ required: true, message: "请选择结束时间", trigger: "change" }],
    assignee: [{ required: true, message: "请选择负责人", trigger: "change" }],
  }));

  // const handleSubmit = async () => {
  //   try {
  //     await formRef.value?.validate();
  //     // 创建新的节点数据
  //     const newNodeData = { ...props.formData };
  //     // 如果选择了父节点，则添加为子节点
  //     if (selectedParent.value) {
  //       // 从wbsSampleData中找到父节点并添加子节点
  //       const findAndAddChild = (nodes: ProjectNode[]): boolean => {
  //         for (const node of nodes) {
  //           if (node.id === selectedParent.value.id) {
  //             // 找到父节点，添加子节点
  //             if (!node.children) {
  //               node.children = [];
  //             }
  //             // 生成新的子节点ID
  //             const newId = `${node.id}-${node.children.length + 1}`;
  //             // 创建新的子节点
  //             const newChild: ProjectNode = {
  //               id: newId,
  //               no: newId,
  //               name: newNodeData.name || "",
  //               priority: newNodeData.priority || [],
  //               status: newNodeData.status || "",
  //               startDate: newNodeData.startDate || "",
  //               endDate: newNodeData.endDate || "",
  //               assignee: newNodeData.assignee || "",
  //               parentRecord: node.name,
  //               checkbox: newNodeData.checkbox || {
  //                 text: "是",
  //                 checked: false,
  //                 disable: false,
  //               },
  //               date: "",
  //               children: [],
  //             };
  //             // 添加到父节点的子节点列表中
  //             node.children.push(newChild);
  //             return true;
  //           }
  //           // 递归查找子节点
  //           if (node.children && node.children.length > 0) {
  //             if (findAndAddChild(node.children)) {
  //               return true;
  //             }
  //           }
  //         }
  //         return false;
  //       };
  //       // 在wbsSampleData中查找并添加子节点
  //       findAndAddChild(wbsSampleData);
  //     } else {
  //       // 没有选择父节点，添加为顶级节点
  //       const newId = `${wbsSampleData.length + 1}`;
  //       const newTopNode: ProjectNode = {
  //         id: newId,
  //         no: newId,
  //         name: newNodeData.name || "",
  //         priority: newNodeData.priority || [],
  //         status: newNodeData.status || "",
  //         startDate: newNodeData.startDate || "",
  //         endDate: newNodeData.endDate || "",
  //         assignee: newNodeData.assignee || "",
  //         checkbox: newNodeData.checkbox || {
  //           text: "是",
  //           checked: false,
  //           disable: false,
  //         },
  //         parentRecord: "",
  //         date: "",
  //         children: [],
  //       };
  //       // 添加到顶级节点列表
  //       wbsSampleData.push(newTopNode);
  //     }
  //     if (addRecord) {
  //       addRecord(wbsSampleData);
  //     }
  //   } catch (err) {
  //     console.warn("表单校验未通过", err);
  //   }
  //   emit("close");
  //   return true;
  // };
  const localDescribe = computed({
    get: () => props.describe,
    set: (val: string) => emit("update:describe", val),
  });
  const emit = defineEmits<{
    (e: "update:describe", val: string): void;
    (e: "close"): void;
    (e: "update:data", val: any): void;
  }>();
  // 监听表单数据变化
  watch(
    () => props.formData,
    (newData) => {
      // 深度克隆数据以避免引用问题
      const clonedData = JSON.parse(JSON.stringify(newData));
      emit("update:data", clonedData);
    },
    { deep: true },
  );
  onMounted(() => {
    fetchFields();
    fetchTableData();
  });
</script>

<style scoped lang="scss">
  .parent-record-selector {
    width: 100%;

    .parent-record-button {
      text-align: left;
      padding: 0;
      height: 32px;
      line-height: 32px;
      width: 100%;
      border: none;
      background-color: transparent;
      color: #666;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        color: #1890ff;
        background-color: transparent;
      }

      &:focus {
        outline: none;
        box-shadow: none;
      }
    }

    .parent-record-button.selected {
      color: #333;
    }
  }

  // 统一所有输入组件的样式
  :deep(.el-items) {
    width: 100%;
    border: none;
    background-color: transparent;
    color: #666;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;

    // 统一所有输入容器的内边距和高度
    .el-input__wrapper,
    .el-select__wrapper,
    .el-date-editor__editor {
      border: none;
      border-radius: 4px;
      box-shadow: none;
      background-color: transparent;
      padding: 0 10px;
      height: 32px; // 固定高度，防止变化
      line-height: 32px; // 保证文字对齐
      display: flex;
      align-items: center;
    }

    // 聚焦或悬停时激活状态
    &:focus,
    &:hover {
      .el-input__wrapper,
      .el-select__wrapper,
      .el-date-editor__editor {
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        padding: 0 10px;
        height: 32px;
        line-height: 32px;
      }
    }

    // 输入框内部文本
    .el-input__inner {
      padding: 0;
      height: 32px;
      line-height: 32px;
      border: none;
      background-color: transparent;
      color: #666;
      font-size: 14px;
      outline: none;
    }

    // 下拉箭头样式
    .el-select__caret {
      color: #999;
    }

    // 下拉菜单样式
    .el-select-dropdown {
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .el-select-dropdown__item {
      padding: 8px 12px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }

    .el-select-dropdown__item:hover {
      background-color: #f5f5f5;
    }

    // 日期选择器图标
    .el-date-editor__icon {
      color: #999;
    }

    // 日期选择器输入框
    .el-date-editor__input {
      padding: 0;
      height: 32px;
      line-height: 32px;
    }
  }

  .form-container {
    margin-top: 20px;
  }

  .parent-selector-dialog {
    .parent-selector-content {
      height: 70vh;
      overflow: hidden;
    }

    .dialog-footer {
      text-align: right;
    }
  }

  .button-container {
    margin-top: 20px;
    width: 100%;
  }
</style>
