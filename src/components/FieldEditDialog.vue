<template>
  <div
    v-if="visible"
    class="field-edit-dialog-overlay"
    :class="{ positioned: props.position }"
  >
    <div
      class="field-edit-dialog"
      :class="{ positioned: adjustedPosition }"
      :style="
        adjustedPosition
          ? {
              left: adjustedPosition.left + 7 + 'px',
              top: adjustedPosition.top + 'px',
            }
          : {}
      "
    >
      <div class="dialog-scrollable">
        <div class="dialog-content">
          <div class="form-item">
            <label for="field-title">标题</label>
            <input
              id="field-title"
              v-model="formData.title"
              type="text"
              placeholder="请输入字段标题"
            />
          </div>

          <div class="form-item">
            <label for="field-type">字段类型</label>
            <div class="field-type-selector">
              <div class="selected-type" @click="toggleTypeOptions">
                <div
                  class="type-icon"
                  v-html="getIconForType(formData.fieldType)"
                ></div>
                <div class="type-text">
                  {{ getTypeName(formData.fieldType) }}
                </div>
                <div class="arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <!-- 独立右侧浮层 -->
              <div
                v-if="showTypeOptions"
                class="type-options-panel"
                ref="typeOptionsRef"
                :style="{
                  left: typeOptionsPosition.left + 'px',
                  top: typeOptionsPosition.top + 'px', // 保持固定
                  maxHeight: typeOptionsMaxHeight + 'px',
                  overflowY: 'auto', // 超出高度显示滚动条
                }"
                @mouseenter="keepOptionsOpen"
                @mouseleave="handleOptionsLeave"
              >
                <div
                  v-for="type in fieldTypes"
                  :key="type.value"
                  class="type-option"
                  @mouseenter="selectedHoverType = type.value"
                  @mouseleave="selectedHoverType = ''"
                  @click="selectFieldType(type.value)"
                >
                  <div
                    class="type-option-content"
                    :class="{ active: formData.fieldType === type.value }"
                  >
                    <div class="type-icon">
                      <div
                        class="type-cus-icon"
                        v-html="getIconForType(type.value)"
                      ></div>
                    </div>
                    <span class="type-text">{{ type.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 选项列表，只在单选或多选时显示 -->
          <div v-if="shouldShowOptions" class="form-item border-t">
            <label>选项内容</label>
            <div class="options-container">
              <!-- 添加选项按钮 -->
              <div class="add-option-btn" @click="addOption">
                <el-icon class="plus-icon"><Plus /></el-icon>
                <div class="plus-text">添加选项</div>
              </div>

              <!-- 选项列表 -->
              <div v-if="formData.options.length > 0" class="options-list">
                <div
                  v-for="(option, index) in formData.options"
                  :key="option.id"
                  class="option-item"
                  draggable="true"
                  @dragstart="onDragStart(index)"
                  @dragover.prevent
                  @dragenter="onDragEnter($event, index)"
                  @dragleave="onDragLeave"
                  @drop="onDrop($event, index)"
                >
                  <div class="option-content">
                    <div class="drag-icon" v-html="dragIcon"></div>

                    <!-- 始终显示输入状态 -->
                    <div class="option-edit">
                      <input
                        type="text"
                        v-model="option.value"
                        placeholder="请输入选项"
                      />
                    </div>
                  </div>
                  <div class="option-actions">
                    <button
                      class="delete-btn"
                      @click.stop="deleteOption(option.id)"
                    >
                      <el-icon><Close /></el-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="close">取消</button>
          <button class="confirm-btn" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed, nextTick, onMounted, onUnmounted } from "vue";
  import { ArrowRight, Plus, Close } from "@element-plus/icons-vue";
  import { getIconForType, dragIcon } from "@/utils/SvgIcons";
  import {
    priorityColors,
    statusColors,
    assigneeAvatars,
  } from "@/data/wbsData";

  import type { DynamicField } from "@/data/wbsFields";

  interface FieldEditDialogProps {
    visible: boolean;
    field?: DynamicField;
    position?: {
      left: number;
      top: number;
    };
  }

  interface FieldEditDialogEmits {
    (e: "close"): void;
    (e: "confirm", data: any): void;
  }

  const props = defineProps<FieldEditDialogProps>();
  const emit = defineEmits<FieldEditDialogEmits>();

  interface Option {
    id: string;
    value: string;
  }

  const formData = ref({
    title: "",
    expectedDate: "",
    fieldType: "text",
    fieldPath: "",
    options: [] as Option[],
  });

  // 字段类型配置
  const fieldTypes = ref([
    { value: "text", name: "文本" },
    { value: "textarea", name: "文本域" },
    { value: "radio", name: "单选" },
    { value: "multiple", name: "多选" },
    { value: "checkbox", name: "复选框" },
    { value: "file", name: "附件" },
    { value: "date", name: "日期" },
    { value: "user", name: "人员" },
    { value: "fn", name: "公式" },
  ]);

  // 状态变量
  const showTypeOptions = ref(false);
  const selectedHoverType = ref("");
  const typeOptionsRef = ref<HTMLDivElement | null>(null);
  const draggedIndex = ref<number | null>(null);

  const adjustedTypeOptionsPosition = ref({ left: 280, top: 0 });
  const adjustedPosition = ref<{ left: number; top: number } | undefined>(
    undefined,
  );

  const updateAdjustedPosition = () => {
    nextTick(() => {
      if (!props.position) return;

      const { left, top } = props.position;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const dialogEl = document.querySelector(
        ".field-edit-dialog",
      ) as HTMLElement;
      if (!dialogEl) return;

      const dialogRect = dialogEl.getBoundingClientRect();
      let finalLeft = left;
      let finalTop = top;

      // 横向超出视口
      if (left + dialogRect.width > viewportWidth) {
        finalLeft = Math.max(0, viewportWidth - dialogRect.width - 10);
      }

      // 纵向超出视口
      if (top + dialogRect.height > viewportHeight) {
        finalTop = Math.max(80, viewportHeight - dialogRect.height - 10);
      } else {
        finalTop = Math.max(80, top);
      }

      adjustedPosition.value = { left: finalLeft, top: finalTop };
    });
  };

  // 初始化和窗口缩放时更新
  watch(
    () => props.visible,
    (val) => {
      if (val) updateAdjustedPosition();
    },
  );
  window.addEventListener("resize", updateAdjustedPosition);

  watch(showTypeOptions, (newValue) => {
    if (newValue) {
      nextTick(() => {
        if (typeOptionsRef.value) {
          const element = typeOptionsRef.value;
          const parentElement = element.parentElement;

          const typeSelectorRect =
            parentElement?.getBoundingClientRect() ||
            ({ right: 0, top: 0, bottom: 0 } as DOMRect);
          const optionsRect =
            element.getBoundingClientRect() ||
            ({ width: 0, height: 0 } as DOMRect);
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          if (
            typeof typeSelectorRect.right === "number" &&
            typeof optionsRect.width === "number" &&
            typeSelectorRect.right + optionsRect.width > viewportWidth
          ) {
            adjustedTypeOptionsPosition.value.left = -optionsRect.width - 8;
          } else {
            adjustedTypeOptionsPosition.value.left =
              typeSelectorRect.width + 10;
          }

          if (
            typeof typeSelectorRect.top === "number" &&
            typeof optionsRect.height === "number" &&
            typeSelectorRect.top + optionsRect.height > viewportHeight
          ) {
            adjustedTypeOptionsPosition.value.top =
              -24 +
              Math.max(
                0,
                viewportHeight -
                  optionsRect.height -
                  (typeof typeSelectorRect.top === "number"
                    ? typeSelectorRect.top
                    : 0),
              );
          } else {
            adjustedTypeOptionsPosition.value.top = 0;
          }
        }
      });
    }
  });

  // 监听field变化，初始化表单数据
  watch(
    () => props.field,
    (newField) => {
      if (newField) {
        formData.value = {
          title: newField.name || "",
          expectedDate: "",
          fieldType: newField.type || "text",
          fieldPath: newField.field || "",
          options: [],
        };
        // 根据字段类型自动填充选项
        autoFillOptionsByField(newField.field);
      }
    },
    { immediate: true },
  );

  // 监听字段类型变化，自动填充选项
  watch(
    () => formData.value.fieldType,
    () => {
      autoFillOptionsByField(formData.value.fieldPath);
    },
  );

  // 根据字段类型自动填充选项
  const autoFillOptionsByField = (fieldName?: string) => {
    // 直接使用计算逻辑而不是引用shouldShowOptions，解决变量定义顺序问题
    const shouldShow =
      formData.value.fieldType === "radio" ||
      formData.value.fieldType === "multiple";
    if (!shouldShow || !fieldName) {
      formData.value.options = [];
      return;
    }

    // 清空现有选项
    formData.value.options = [];

    // 根据字段名称自动填充选项
    switch (fieldName) {
      case "priority":
        // 从priorityColors获取优先级选项
        Object.keys(priorityColors).forEach((key) => {
          formData.value.options.push({
            id: Date.now().toString() + key,
            value: key,
          });
        });
        break;
      case "status":
        // 从statusColors获取状态选项
        Object.keys(statusColors).forEach((key) => {
          formData.value.options.push({
            id: Date.now().toString() + key,
            value: key,
          });
        });
        break;
      case "assignee":
        // 从assigneeAvatars获取人员选项
        Object.keys(assigneeAvatars).forEach((key) => {
          formData.value.options.push({
            id: Date.now().toString() + key,
            value: key,
          });
        });
        break;
      default:
        // 其他字段类型不自动填充
        break;
    }
  };

  // 添加选项
  const addOption = () => {
    const newOption: Option = {
      id: Date.now().toString(),
      value: "",
    };
    formData.value.options.push(newOption);

    nextTick(() => {
      // 获取最后一个选项的输入框并聚焦
      const optionElements = document.querySelectorAll(".option-edit input");
      if (optionElements.length > 0) {
        const lastInput = optionElements[
          optionElements.length - 1
        ] as HTMLInputElement;
        lastInput.focus();
        updateAdjustedPosition();
      }
    });
  };

  // 删除选项
  const deleteOption = (id: string) => {
    formData.value.options = formData.value.options.filter(
      (opt) => opt.id !== id,
    );
  };

  // 拖拽开始处理函数
  const onDragStart = (index: number) => {
    draggedIndex.value = index;
  };

  // 拖拽进入处理函数
  const onDragEnter = (event: DragEvent, index: number) => {
    if (draggedIndex.value !== null && draggedIndex.value !== index) {
      const eventTarget = event.target as HTMLElement;
      eventTarget.classList.add("drag-over");
    }
  };

  // 拖拽离开处理函数
  const onDragLeave = () => {
    const dragOverItems = document.querySelectorAll(".option-item.drag-over");
    dragOverItems.forEach((item) => item.classList.remove("drag-over"));
  };

  // 拖拽放置处理函数
  const onDrop = (event: DragEvent, dropIndex: number) => {
    // 移除所有拖拽中的样式
    onDragLeave();

    if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
      return;
    }

    const draggedOption = formData.value.options[draggedIndex.value];
    const newOptions = [...formData.value.options];

    // 从原始位置移除
    newOptions.splice(draggedIndex.value, 1);
    // 插入到新位置
    newOptions.splice(dropIndex, 0, draggedOption);

    formData.value.options = newOptions;
    draggedIndex.value = null;
  };

  // 检查是否需要显示选项
  const shouldShowOptions = computed(() => {
    return (
      formData.value.fieldType === "radio" ||
      formData.value.fieldType === "multiple"
    );
  });

  // 获取字段类型名称
  const getTypeName = (type: string) => {
    const fieldType = fieldTypes.value.find((t) => t.value === type);
    return fieldType ? fieldType.name : "文本";
  };

  // 选择字段类型
  const selectFieldType = (type: string) => {
    formData.value.fieldType = type;
    showTypeOptions.value = false;
    nextTick(() => {
      updateAdjustedPosition();
    });
  };

  const handleTypeSelectorLeave = () => {
    setTimeout(() => {
      if (typeOptionsRef.value && !typeOptionsRef.value.matches(":hover")) {
        showTypeOptions.value = false;
      }
    }, 200);
  };

  const keepOptionsOpen = () => {
    showTypeOptions.value = true;
  };

  const handleOptionsLeave = () => {
    showTypeOptions.value = false;
  };

  const close = (event: MouseEvent) => {
    event.stopPropagation();
    emit("close");
  };

  const confirm = (event: MouseEvent) => {
    event.stopPropagation();
    // 处理单选或多选类型时，确保选项数据被正确传递
    const dataToEmit = {
      ...formData.value,
      // 只有在单选或多选类型时才包含选项
      options: shouldShowOptions.value ? formData.value.options : undefined,
    };
    emit("confirm", dataToEmit);
  };
  const updatePositionOnResize = () => {
    if (adjustedPosition.value) {
      adjustedPosition.value = { ...adjustedPosition.value };
    }
  };

  const typeOptionsPosition = ref({ left: 0, top: 0 });
  const typeOptionsMaxHeight = ref(300);

  const toggleTypeOptions = () => {
    showTypeOptions.value = !showTypeOptions.value;
    if (showTypeOptions.value) {
      calculateTypeOptionsPosition();
      updateAdjustedPosition();
    }
  };

  const calculateTypeOptionsPosition = () => {
    nextTick(() => {
      const selector = document.querySelector(".selected-type") as HTMLElement;
      const panel = typeOptionsRef.value;
      if (!selector || !panel) return;

      const selectorRect = selector.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 默认显示在右侧
      let left = selectorRect.right + 4;
      const top = selectorRect.top; // 固定 top

      // 右侧超出屏幕则显示在左侧
      if (left + panel.offsetWidth > viewportWidth) {
        left = selectorRect.left - panel.offsetWidth - 4;
      }

      // 最大高度：从浮层顶部到视口底部预留50px
      const maxHeight = viewportHeight - selectorRect.top;

      // 更新位置和最大高度
      typeOptionsPosition.value = { left, top };
      typeOptionsMaxHeight.value = maxHeight > 100 ? maxHeight : 100; // 最小高度100px
    });
  };

  // 监听窗口变化，重新计算浮层位置
  const onResize = () => {
    if (showTypeOptions.value) calculateTypeOptionsPosition();
  };

  onMounted(() => {
    window.addEventListener("resize", updatePositionOnResize);
    window.addEventListener("resize", onResize);
  });
  onUnmounted(() => {
    window.removeEventListener("resize", updatePositionOnResize);
    window.removeEventListener("resize", onResize);
  });
</script>

<style scoped lang="scss">
  .field-edit-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    z-index: 2000;
    align-items: center;
    justify-content: center;
  }

  .field-edit-dialog-overlay.positioned {
    align-items: flex-start;
    justify-content: flex-start;
    overflow: hidden;
  }

  .field-edit-dialog {
    width: 300px;
    max-height: 80vh; // 弹窗整体最大高度
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #dee0e3;
    overflow: hidden; // 外层隐藏溢出

    .dialog-scrollable {
      max-height: 80vh; // 可滚动区域
      overflow-y: auto; // 内容超出时出现滚动条
      box-sizing: border-box;
    }
  }

  .field-edit-dialog.positioned {
    position: absolute;
    max-height: calc(100vh - 40px); // 弹窗整体最大高度，保证不会超出视口
    min-height: 150px; // 最小高度
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 6px;
    overflow: hidden;
  }

  .dialog-content {
    padding: 16px;
    overflow-y: auto; // 超出内容出现滚动条
    flex: 1; // 占据弹窗剩余空间
  }

  .form-item {
    margin-bottom: 16px;
  }

  .form-item:last-child {
    margin-bottom: 0;
  }

  .form-item label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #646a73;
  }

  .form-item input {
    width: 100%;
    padding: 7px 12px;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    font-size: 14px !important;
    transition: border-color 0.3s;
    box-sizing: border-box;
    background-color: #fff !important;
    color: #1f2329 !important;
  }

  .form-item input:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  .form-item input[readonly] {
    background-color: #f5f6f7;
    cursor: not-allowed;
  }

  .field-type-selector {
    position: relative;
    width: 100%;
  }

  .selected-type {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    background-color: #fff;
    cursor: pointer;
    transition: border-color 0.3s;
  }

  .type-options::before {
    content: "";
    position: absolute;
    left: -8px;
    top: 0;
    bottom: 0;
    width: 8px;
    background: transparent;
  }

  .selected-type:hover {
    border-color: #1890ff;
  }

  .type-icon {
    width: 20px;
    text-align: center;
    margin-right: 6px;
    color: #646a73;
    line-height: 20px;
    height: 17px;
  }
  .type-cus-icon {
    margin-top: 1px;
  }

  .type-text {
    flex: 1;
    font-size: 14px;
    color: #2b2f36;
  }

  .arrow {
    color: #8f959e;
    font-size: 14px;
    transition: transform 0.3s;
    display: flex;
  }

  .type-options {
    position: absolute;
    top: 0;
    left: 100%;
    width: 160px;
    background-color: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-height: 300px;
    overflow-y: auto;
    padding: 6px 0;
  }

  .field-edit-dialog {
    overflow: visible !important;
  }

  .field-edit-dialog-overlay {
    overflow: visible !important;
  }

  .type-option {
    display: flex;
    align-items: center;
    padding: 0px 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
  }
  .type-option-content {
    display: flex;
    align-items: center;
    padding: 8px 4px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }
  .type-option-content:hover,
  .type-option-content.active {
    background-color: rgba(31, 35, 41, 0.1);
    color: #1890ff;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 16px;
    flex-shrink: 0; // 不缩小
  }

  .cancel-btn {
    padding: 4px 16px;
    background-color: #fff;
    color: #2b2f36;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    width: 80px;
  }

  .cancel-btn:hover {
    color: #1890ff;
    border-color: #1890ff;
  }

  .confirm-btn {
    padding: 4px 20px;
    background-color: #1890ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 80px;
  }

  /* 选项容器样式 */
  .options-container {
    border: 1px solid #dee0e3;
    border-radius: 6px;
    padding: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .add-option-btn {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    color: #1890ff;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
  }

  .add-option-btn:hover {
    background-color: rgba(24, 144, 255, 0.1);
  }

  .plus-icon {
    margin-right: 6px;
    font-size: 14px;
  }
  .plus-text {
    font-size: 14px;
  }

  .options-list {
    margin-top: 8px;
  }

  .option-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    margin-bottom: 4px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }

  .option-item:hover {
    background-color: #f5f6f7;
  }

  /* 拖拽相关样式 */
  .option-item.dragging {
    opacity: 0.5;
  }

  .option-item.drag-over {
    background-color: rgba(24, 144, 255, 0.1);
    border: 1px dashed #1890ff;
  }

  .option-content {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .drag-icon {
    margin-right: 6px;
    color: #8f959e;
    cursor: move;
    font-size: 14px;
    user-select: none;
    display: flex;
    align-items: center;
  }

  .option-index {
    margin-right: 8px;
    font-size: 14px;
    color: #646a73;
  }

  .arrow-icon {
    margin-right: 8px;
    color: #8f959e;
    font-size: 12px;
  }

  .option-edit {
    flex: 1;
  }

  .option-edit input {
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }

  .option-edit input:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  .option-display {
    flex: 1;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: text;
    min-height: 24px;
    align-self: stretch;
    display: flex;
    align-items: center;
  }

  .option-display:hover {
    background-color: rgba(31, 35, 41, 0.05);
  }

  .option-actions {
    display: flex;
    align-items: center;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #8f959e;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition:
      color 0.3s,
      background-color 0.3s;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-btn:hover {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.1);
  }
  .border-t {
    border-top: 1px solid rgba(31, 35, 41, 0.15);
    padding-top: 12px;
  }
  .type-options-panel {
    padding: 12px 0;
    position: fixed;
    width: 160px;
    min-height: 100px;
    background-color: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
    z-index: 2100;
  }
</style>
