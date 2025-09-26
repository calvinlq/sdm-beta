<template>
  <div
    class="field-config-popup"
    v-if="visible"
    :style="{
      left: position.left + 'px',
      top: position.top + 'px',
    }"
  >
    <div class="field-config-dialog">
      <div class="dialog-header" v-if="isFirstFieldLock">
        <div class="dialog-title">字段配置</div>
        <div class="dialog-help-icon">
          <div v-html="questionIcon"></div>
        </div>
      </div>

      <div class="field-list">
        <div
          v-if="fields.length"
          class="field-item border-b"
          @click="selectField(fields[0])"
        >
          <div class="field-item-content">
            <div
              class="field-item-content-left"
              :class="{ invisible: !fields[0].invisible }"
            >
              <div class="field-icon">
                <div v-html="getIconForType(fields[0].type)"></div>
              </div>
              <div class="field-name">{{ fields[0].name }}</div>
              <el-icon size="14" class="lock-icon"><Lock /></el-icon>
            </div>

            <div class="field-actions" v-if="isFirstFieldLock">
              <div></div>
              <div class="icon-btn">
                <el-icon @click.stop="showFieldMenu(fields[0], $event)"
                  ><MoreFilled
                /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 可拖拽的字段列表 -->
        <div class="draggable-list-divider"></div>
        <draggable
          v-if="fields.length > 1"
          v-model="draggableFields"
          item-key="id"
          class="draggable-list"
          :class="{ 'is-dragging': isDragging }"
          ghost-class="ghost-class"
          chosen-class="chosen-class"
          animation="200"
          handle=".field-item"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element: field }">
            <div class="field-item sub-item" @click="selectField(field)">
              <div class="field-item-content">
                <div
                  class="field-item-content-left"
                  :class="{ invisible: !field.invisible }"
                >
                  <div class="drag-handle">
                    <div v-html="dragIcon"></div>
                  </div>
                  <div class="field-icon">
                    <div
                      v-html="getIconForType(field.type)"
                      v-if="getIconForType(field.type)"
                    />
                  </div>
                  <div class="field-name">{{ field.name }}</div>
                </div>

                <div class="field-actions">
                  <div class="icon-btn">
                    <el-icon
                      @click.stop="toggleFieldHidden(field, false)"
                      v-if="field.invisible"
                      ><View
                    /></el-icon>
                    <el-icon @click.stop="toggleFieldHidden(field, true)" v-else
                      ><Hide
                    /></el-icon>
                  </div>
                  <div class="icon-btn" v-if="allowEdit">
                    <el-icon @click.stop="showFieldMenu(field, $event)"
                      ><MoreFilled
                    /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>
        <div class="draggable-list-divider"></div>
      </div>

      <button class="add-field-btn" @click="addNewField" v-if="allowEdit">
        <span class="add-icon">+</span>
        新增字段
      </button>
    </div>

    <!-- 字段上下文菜单 -->
    <div
      v-if="showFieldContextMenu && selectedField"
      class="field-context-menu"
      :style="{
        left: fieldMenuPosition.left + 'px',
        top: fieldMenuPosition.top + 'px',
      }"
      @click.stop
    >
      <div class="menu-item border-b" @click="editField(selectedField!)">
        <div class="menu-item-content">
          <el-icon><EditPen /></el-icon>
          <span>编辑</span>
        </div>
      </div>
      <div class="menu-item delete" @click="deleteField(selectedField!)">
        <div class="menu-item-content">
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted } from "vue";
  import { ElIcon } from "element-plus";
  import {
    EditPen,
    Delete,
    MoreFilled,
    View,
    Hide,
    Lock,
  } from "@element-plus/icons-vue";
  import { questionIcon, getIconForType, dragIcon } from "@/utils/SvgIcons";
  import draggable from "vuedraggable/src/vuedraggable.js";
  import type { DynamicField } from "@/data/wbsFields";

  // 定义props
  interface FieldConfigPopupProps {
    fields: DynamicField[];
    visible: boolean;
    position: { left: number; top: number };
    fieldId?: number;
  }

  const props = defineProps<FieldConfigPopupProps>();

  // 定义emits
  const emit = defineEmits<{
    (e: "close"): void;
    (e: "fieldSelected", field: DynamicField): void;
    (e: "addField"): void;
    (e: "updateFieldVisibility", fieldId: number, invisible: boolean): void;
    (e: "updateField", fieldId: number, data: any): void;
    (e: "deleteField", fieldId: number): void;
    (e: "fieldReordered", fields: DynamicField[]): void;
    (e: "editField", field: DynamicField): void;
    (e: "fieldsChange", fields: DynamicField[]): void;
  }>();

  const showFieldContextMenu = ref(false);
  const selectedField = ref<DynamicField | null>(null);
  const fieldMenuPosition = ref({ left: 0, top: 0 });
  const draggableFields = ref<DynamicField[]>([]);
  const isDragging = ref(false);
  const isFirstFieldLock = ref(false);
  const allowEdit = ref(false);

  watch(
    () => props.fields,
    (newFields) => {
      if (newFields.length > 1) {
        draggableFields.value = [...newFields.slice(1)];
      }
    },
    { immediate: true },
  );

  watch(
    () => props.visible,
    (newVisible) => {
      if (!newVisible) {
        showFieldContextMenu.value = false;
      }
    },
  );

  // 拖拽开始时的回调
  const onDragStart = (evt: DragEvent) => {
    showFieldContextMenu.value = false;
    isDragging.value = true;
    if (evt.target instanceof HTMLElement) {
      const fieldItem = evt.target.closest(".field-item");
      if (fieldItem) {
        fieldItem.classList.add("dragging");
      }
    }
  };

  // 拖拽结束后的回调
  const onDragEnd = (evt: DragEvent) => {
    if (evt.target instanceof HTMLElement) {
      const fieldItem = evt.target.closest(".field-item");
      if (fieldItem) {
        fieldItem.classList.remove("dragging");
      }
    }
    isDragging.value = false;

    // 构建重排序后的字段数组
    const reorderedFields: DynamicField[] = [];
    if (props.fields.length > 0) {
      reorderedFields.push({ ...props.fields[0] });
      draggableFields.value.forEach((field) => {
        reorderedFields.push({ ...field });
      });

      emit("fieldReordered", reorderedFields);
      emit("fieldsChange", reorderedFields);
    }
  };

  const toggleFieldHidden = (field: DynamicField, invisible: boolean) => {
    emit("updateFieldVisibility", field.id, invisible);

    const updatedFields = [...props.fields];
    const fieldIndex = updatedFields.findIndex((f) => f.id === field.id);
    if (fieldIndex !== -1) {
      updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], invisible };
      emit("fieldsChange", updatedFields);
    }
  };

  // 选择字段
  const selectField = (field: DynamicField) => {
    emit("fieldSelected", field);
  };

  const showFieldMenu = (field: DynamicField, event: MouseEvent) => {
    event.stopPropagation();
    selectedField.value = field;

    if (event.currentTarget instanceof HTMLElement) {
      const rect = event.currentTarget.getBoundingClientRect();
      const menuWidth = 120;
      const menuHeight = 100;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.right + 8;
      let top = rect.top + rect.height / 2 - 16;

      if (left + menuWidth > viewportWidth) {
        left = rect.left - menuWidth - 8;
      }

      if (top + menuHeight > viewportHeight) {
        top = Math.max(0, viewportHeight - menuHeight - 34);
      }

      fieldMenuPosition.value = {
        left,
        top,
      };
    }

    showFieldContextMenu.value = true;
  };

  // 编辑字段
  const editField = (field: DynamicField) => {
    showFieldContextMenu.value = false;
    emit("editField", field);
  };

  // 删除字段
  const deleteField = (field: DynamicField) => {
    showFieldContextMenu.value = false;
    emit("deleteField", field.id);

    const updatedFields = props.fields.filter((f) => f.id !== field.id);
    emit("fieldsChange", updatedFields);
  };

  // 添加新字段
  const addNewField = () => {
    emit("addField");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (props.visible) {
      const popup = document.querySelector(".field-config-popup");
      const contextMenu = document.querySelector(".field-context-menu");

      const isMoreActionsButton = (event.target as HTMLElement)
        ?.closest(".icon-btn")
        ?.querySelector('el-icon[class*="morefilled"]');

      if (isMoreActionsButton) {
        return;
      }

      const isOutsidePopup = popup && !popup.contains(event.target as Node);
      const isOutsideContextMenu =
        !contextMenu || !contextMenu.contains(event.target as Node);

      if (isOutsidePopup && isOutsideContextMenu) {
        emit("close");
      }
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped lang="scss">
  $primary-color: #1890ff;
  $success-color: #52c41a;
  $warning-color: #fa8c16;
  $danger-color: #ff4d4f;
  $text-color: #646a73;
  $light-text: rgba(0, 0, 0, 0.5);
  $border-color: #e0e0e0;
  $background-color: #f8f9fa;
  $hover-bg: #e6f7ff;

  .field-config-popup {
    position: fixed;
    z-index: 1000;
    border: 1px solid #dee0e3;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    background: white;
    margin-right: 8px;
  }

  .field-context-menu {
    position: fixed;
    z-index: 9999;
    min-width: 112px;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    pointer-events: auto;
    transform: translateZ(0);
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 5px 6px;
    height: 32px;
    font-size: 14px;
    color: #1f2329;
    cursor: pointer;
    width: 150px;
    gap: 8px;
    transition: background-color 0.2s;
    .menu-item-content {
      padding: 6px;
      border-radius: 4px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 6px;
      &:hover {
        background-color: rgba(31, 35, 41, 0.1);
      }
    }
  }

  .border-t-b {
    border-top: 1px solid rgba(31, 35, 41, 0.15);
    border-bottom: 1px solid rgba(31, 35, 41, 0.15);
  }

  .border-b {
    border-bottom: 1px solid rgba(31, 35, 41, 0.15);
  }

  .menu-item el-icon {
    margin-right: 6px;
    font-size: 14px;
  }

  .field-config-dialog {
    width: 240px;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 18px;
    border-bottom: 1px solid rgba(31, 35, 41, 0.15);
  }

  .dialog-title {
    font-size: 14px;
    height: 32px;
    line-height: 36px;
    color: #2b2f36;
  }

  .dialog-help-icon {
    color: #8f959e;
    cursor: pointer;
    font-size: 14px;
    margin-top: 6px;
  }

  .help-icon {
    color: #8f959e;
    cursor: pointer;
    font-size: 16px;
  }

  .field-list {
    max-height: 400px;
    overflow-y: auto;
    .field-item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 6px 8px 6px 2px;
      border-radius: 4px;
      &:hover {
        background: rgba(31, 35, 41, 0.1);
        transition: background-color 0.2s;
      }
    }
    .field-item-content-left {
      display: flex;
      align-items: center;
      padding: 0 0 0 6px;
      .lock-icon {
        margin-left: 4px;
      }
    }
    .invisible {
      color: rgb(187, 191, 196);
    }
  }

  .draggable-list-divider {
    height: 6px;
  }

  .draggable-list {
    width: 100%;
  }

  .drag-handle {
    cursor: grab;
    opacity: 0;
    justify-content: center;
    align-items: center;
    width: 0px;
    height: 20px;
    margin-right: 2px;
    transition: opacity 0.2s;
    display: flex;
    margin-top: 5px;
    font-size: 12px;

    &:hover {
      opacity: 1;
      color: rgba(31, 35, 41, 0.1);
      transition: background-color 0.2s;
    }

    &:active {
      cursor: grabbing;
    }
  }

  .field-item:hover .drag-handle {
    opacity: 0.5;
  }

  .field-item.dragging .drag-handle,
  .field-item.dragging .field-actions,
  .field-item.dragging .field-icon {
    opacity: 0 !important;
  }

  .draggable-list.is-dragging .drag-handle {
    opacity: 0 !important;
  }

  .draggable-list .field-item {
    transition: background-color 0.2s;
    position: relative;
  }

  .draggable-list .field-item:hover {
    background-color: #fff;
  }

  .draggable-list .ghost-class {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    height: 8px !important;
    padding: 0 0 0 12px !important;
    margin: 0 6px !important;
    background-image: linear-gradient(to right, #1890ff, #1890ff) !important;
    background-size: 100% 1px !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    overflow: hidden !important;
    text-indent: -9999px !important;
    color: transparent !important;
    min-height: 8px !important;
    max-height: 8px !important;
    white-space: nowrap !important;
    position: relative !important;
    z-index: 10 !important;
  }

  .draggable-list .ghost-class::before {
    content: "" !important;
    position: absolute !important;
    left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-top: 6px solid transparent !important;
    border-bottom: 6px solid transparent !important;
    border-left: 6px solid #1890ff !important;
    z-index: 11 !important;
  }

  /* 确保ghost元素内部所有子元素也不显示 */
  .draggable-list .ghost-class * {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  .draggable-list .chosen-class {
    opacity: 0.5 !important;
    background-color: #f5f6f7 !important;
    color: #8f959e !important;
  }

  .field-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
    transition: background-color 0.2s;
    cursor: grab;
  }

  .sub-item {
    padding: 0 4px !important;
  }

  .field-item:hover {
    background-color: #fff;
    transition: background-color 0.2s;
  }

  .field-icon {
    width: 24px;
    height: 16px;
    line-height: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
  }

  .field-name {
    font-size: 14px;
    color: #1f2329;
  }

  .field-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .icon-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: #8f959e;

    &:hover {
      background-color: rgba(31, 35, 41, 0.1);
      color: #1f2329;
    }
  }

  .add-field-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 8px 0;
    border: none;
    background: #fff;
    border-top: 1px solid rgba(31, 35, 41, 0.15);
    color: $primary-color;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f6f7;
    }
  }

  .add-icon {
    font-weight: 600;
  }

  .delete .menu-item-content:hover {
    background-color: rgba(255, 77, 79, 0.1) !important;
    color: $danger-color !important;
  }

  .delete:hover {
    color: $danger-color;
  }
</style>
