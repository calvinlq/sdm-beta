<template>
  <el-select
    ref="selectRef"
    v-model="selectedValue"
    :multiple="multiple"
    :filterable="filterable"
    :allow-create="allowCreate"
    :default-first-option="defaultFirstOption"
    :placeholder="placeholder"
    :popper-class="'custom-select-popup'"
    @change="handleChange"
    @visible-change="handleVisibleChange"
    @blur="handleBlur"
    style="width: 100%"
  >
    <el-option
      v-for="item in filteredOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :class="{ selected: isSelected(item.value) }"
    >
      <div class="custom-select-option">
        <span
          v-if="item.tag"
          :class="['option-tag', `tag-${item.tag.toLowerCase()}`]"
        >
          {{ item.tag }}
        </span>
        <span>{{ item.label }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, watch, onMounted } from "vue";
  import type { PropType } from "vue";
  import { ElSelect } from "element-plus";

  export interface SelectOption {
    value: string | number;
    label: string;
    tag?: string;
  }

  // 默认组件导出
  export default defineComponent({
    name: "CLSelect",
    components: { ElSelect },
    props: {
      modelValue: {
        type: [String, Number, Array] as PropType<
          string | number | (string | number)[]
        >,
        default: "",
      },
      options: {
        type: Array as PropType<SelectOption[]>,
        default: () => [],
      },
      placeholder: {
        type: String,
        default: "查找或创建选项",
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      filterable: {
        type: Boolean,
        default: true,
      },
      allowCreate: {
        type: Boolean,
        default: true,
      },
      defaultFirstOption: {
        type: Boolean,
        default: true,
      },
      // 用于vTable集成
      cellEditor: {
        type: Object,
        default: null,
      },
    },
    emits: ["update:modelValue", "change", "blur", "visible-change"],
    setup(props, { emit }) {
      const selectRef = ref<InstanceType<typeof ElSelect> | null>(null);
      const selectedValue = ref(props.modelValue);
      const isOpen = ref(false);

      // 过滤选项（根据搜索条件）
      const filteredOptions = computed(() => {
        return props.options;
      });

      // 检查选项是否被选中
      const isSelected = (value: string | number) => {
        if (props.multiple && Array.isArray(selectedValue.value)) {
          return selectedValue.value.includes(value);
        }
        return selectedValue.value === value;
      };

      // 处理值变化
      const handleChange = (value: string | number | (string | number)[]) => {
        emit("update:modelValue", value);
        emit("change", value);

        // 如果是单选且通过vTable使用，选择后自动退出编辑状态
        if (!props.multiple && props.cellEditor) {
          setTimeout(() => {
            if (props.cellEditor && props.cellEditor.completeEdit) {
              props.cellEditor.completeEdit();
            }
          }, 100);
        }
      };

      // 处理下拉框显示状态变化
      const handleVisibleChange = (visible: boolean) => {
        isOpen.value = visible;
        emit("visible-change", visible);
      };

      // 处理失去焦点事件
      const handleBlur = (event: FocusEvent) => {
        emit("blur", event);

        // 如果是通过vTable使用，失去焦点时退出编辑状态
        if (props.cellEditor) {
          setTimeout(() => {
            if (props.cellEditor && props.cellEditor.completeEdit) {
              props.cellEditor.completeEdit();
            }
          }, 100);
        }
      };

      // 聚焦选择框
      const focus = () => {
        if (selectRef.value) {
          selectRef.value.focus();
        }
      };

      // 监视外部值变化
      watch(
        () => props.modelValue,
        (newValue) => {
          selectedValue.value = newValue;
        },
      );

      // 组件挂载后自动聚焦
      onMounted(() => {
        setTimeout(() => {
          focus();
        }, 50);
      });

      return {
        selectRef,
        selectedValue,
        filteredOptions,
        isOpen,
        isSelected,
        handleChange,
        handleVisibleChange,
        handleBlur,
        focus,
      };
    },
  });
</script>

<style scoped>
  :deep(.custom-select-popup) {
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
    padding: 8px 0;
    max-height: 280px;
    overflow-y: auto;
  }

  :deep(.el-select .el-input) {
    --el-input-border-color: transparent !important;
  }

  :deep(.el-select .el-input__wrapper) {
    border: none !important;
    box-shadow: none !important;
    background-color: transparent !important;
  }

  :deep(.el-select .el-input__wrapper.is-focus) {
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.el-select .el-input__wrapper:hover) {
    border: none !important;
    box-shadow: none !important;
    background-color: transparent !important;
  }

  :deep(.el-input__inner) {
    border: none !important;
    box-shadow: none !important;
    background-color: transparent !important;
  }

  :deep(.el-input__inner:focus) {
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.custom-select-option) {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  :deep(.custom-select-option:hover) {
    background-color: #f2f4f7;
  }

  :deep(.custom-select-option.selected) {
    background-color: #eaf0ff;
    color: #3370ff;
  }

  :deep(.option-tag) {
    display: inline-block;
    width: 40px;
    height: 22px;
    border-radius: 4px;
    text-align: center;
    line-height: 22px;
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
  }

  :deep(.tag-p0) {
    background-color: #ffd0e2;
    color: #f14f93;
  }

  :deep(.tag-p1) {
    background-color: #ffe5c5;
    color: #e75c25;
  }

  :deep(.tag-p2) {
    background-color: #ccf0ff;
    color: #1d91f9;
  }

  :deep(.tag-p3) {
    background-color: #d8fcd4;
    color: #27c346;
  }

  :deep(.search-input) {
    padding: 8px 12px;
    border-bottom: 1px solid #ebedf0;
    margin-bottom: 8px;
  }

  :deep(.search-input input) {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    outline: none;
  }

  :deep(.search-input input:focus) {
    border-color: #3370ff;
  }

  :deep(.create-option) {
    color: #3370ff;
    font-weight: 500;
  }
</style>
