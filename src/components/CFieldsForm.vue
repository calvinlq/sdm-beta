<template>
  <div class="form-container">
    <el-form
      :model="formData"
      ref="formRef"
      label-width="120px"
      class="form-body"
    >
      <template v-for="field in props.computedFields" :key="field.id">
        <el-form-item
          :label="field.name"
          :prop="field.field"
          :rules="field.rules"
          v-if="field.invisible"
        >
          <!-- 父记录选择 -->
          <div
            v-if="field.field === 'parentRecord'"
            class="parent-record-selector"
          >
            <el-button type="primary" link class="parent-record-button">
              {{ formData[field.field] || `请选择${field.name}` }}
            </el-button>
          </div>

          <!-- 文本输入 -->
          <el-input
            v-else-if="field.type === 'text'"
            v-model="formData[field.field]"
            :placeholder="`请输入${field.name}`"
            class="el-items"
          />

          <!-- 多行文本 -->
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.field]"
            :placeholder="`请输入${field.name}`"
            class="el-items"
            type="textarea"
          />

          <!-- 下拉选择 -->
          <el-select
            v-else-if="
              field.type === 'radio' ||
              field.type === 'multiple' ||
              field.type === 'select'
            "
            v-model="formData[field.field]"
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
            v-model="formData[field.field]"
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
            v-model="formData[field.field]"
            type="date"
            :placeholder="`请选择${field.name}`"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
            style="width: 100%"
            class="el-items"
          />
          <el-color-picker-panel
            v-else-if="field.type === 'color'"
            v-model="formData[field.field]"
            :placeholder="`请选择${field.name}`"
            style="width: 100%"
            class="el-items"
          />

          <IconSelect
            v-else-if="field.type === 'iconSelect'"
            v-model="formData[field.field]"
            style="width: 100%"
            class="el-items"
          />
          <!-- 用户选择 -->
          <el-select
            v-else-if="field.type === 'user'"
            v-model="formData[field.field]"
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
            v-model="formData[field.field]"
            type="textarea"
            :rows="3"
            placeholder="请输入函数表达式"
            class="el-items"
          />

          <!-- 开关 -->
          <el-switch
            v-else-if="field.type === 'switch'"
            v-model="formData[field.field]"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #eae4e4;
            "
          />

          <!-- 默认兜底 -->
          <el-input
            class="el-items"
            v-else
            v-model="formData[field.field]"
            :placeholder="`请输入${field.name}`"
          />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<!--
  自定义表单组件
    该组件仅仅负责展示表单，数据由computedFields驱动（没有提交表单的按钮）
    提交表单，校验和重置表单状态均在外层组件调用暴露initForm，validForm方法
-->
<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";
  import type { FormInstance } from "element-plus";
  import { assigneeAvatars } from "@/data/wbsData.ts";
  import type { DynamicField } from "@/data/wbsFields.ts";
  import IconSelect from "@/components/iconSelect.vue";

  const props = defineProps<{
    computedFields: DynamicField[];
    viewData: Record<string, any>;
  }>();

  const formRef = ref<FormInstance>();
  const formData = defineModel<Record<string, any>>({});
  console.log(props.viewData, "1111");

  watch(
    () => props.viewData,
    (newVal, oldVal) => {
      // 为表单赋值
      props.computedFields.forEach(({ field, defaultValue }) => {
        // formData
        formData.value[field] = props.viewData[field] || defaultValue;
      });
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const handleCheckboxChange = (field: string, value: boolean) => {
    if (!formData.value[field]) {
      formData.value[field] = { text: "是", checked: false, disable: false };
    }
    formData.value[field].checked = value;
  };
  const getCheckboxValue = (fieldKey: string) => {
    const fieldData = formData.value[fieldKey];
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
    const fieldData = formData.value[fieldKey];
    if (fieldData && typeof fieldData === "object" && fieldData.text) {
      return fieldData.text;
    }
    return "是"; // 默认文本
  };

  const initForm = () => {
    formRef.value?.clearValidate();
    formRef.value?.resetFields();
    for (let key in props.viewData) {
      props.viewData[key] = "";
    }
  };

  // 表单校验
  const validForm = () => {
    return new Promise((resolve, reject) => {
      formRef.value?.validate((vaild) => {
        if (vaild) {
          console.log("validForm", "校验通过");
          resolve(true);
        }
        resolve(false);
      });
    });
  };

  defineExpose({
    initForm,
    validForm,
  });

  onMounted(() => {});
  onBeforeUnmount(() => {
    console.log("onBeforeUnmount", "onBeforeUnmount");
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
