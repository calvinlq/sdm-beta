<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <button
          v-if="props.visibleButtons?.add?.enable"
          class="toolbar-btn toolbar-btn-add"
          @click="openAddRecordDialog"
        >
          <el-icon><Plus /></el-icon>
          {{ props.visibleButtons?.add?.name || "添加" }}
        </button>
        <div
          v-if="props.visibleButtons?.fieldConfig"
          class="field-config-wrapper"
          ref="fieldConfigWrapper"
        >
          <button @click="toggleFieldConfig" class="toolbar-btn">
            <el-icon><Setting /></el-icon> 字段配置
          </button>
          <div class="field-config-popup" v-if="showFieldConfig">
            <div class="field-config-dialog">
              <div class="dialog-header">
                <div class="dialog-title">字段配置</div>
                <div class="dialog-help-icon">
                  <div v-html="questionIcon"></div>
                </div>
              </div>

              <div class="field-list">
                <!-- 锁定的第一个字段 -->
                <div
                  v-if="props.fields.length > 0"
                  class="field-item border-b"
                  @click="selectField(props.fields[0])"
                >
                  <div class="field-item-content">
                    <div
                      class="field-item-content-left"
                      :class="{ invisible: !props.fields[0].invisible }"
                    >
                      <div class="field-icon">
                        <div
                          v-html="getIconForType(props.fields[0].type)"
                        ></div>
                      </div>
                      <div class="field-name">{{ props.fields[0].name }}</div>
                      <el-icon size="14" class="lock-icon"><Lock /></el-icon>
                    </div>

                    <div class="field-actions">
                      <div></div>
                      <div class="icon-btn">
                        <el-icon
                          @click.stop="showFieldMenu(props.fields[0], $event)"
                          ><MoreFilled
                        /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 可拖拽的字段列表 -->
                <div class="draggable-list-divider"></div>
                <draggable
                  v-if="props.fields.length > 1"
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
                    <div
                      class="field-item sub-item"
                      @click="selectField(field)"
                    >
                      <div class="field-item-content">
                        <div
                          class="field-item-content-left"
                          :class="{ invisible: !field.invisible }"
                        >
                          <div class="drag-handle">
                            <div v-html="dragIcon"></div>
                          </div>
                          <div class="field-icon">
                            <div v-html="getIconForType(field.type)"></div>
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
                            <el-icon
                              @click.stop="toggleFieldHidden(field, true)"
                              v-else
                              ><Hide
                            /></el-icon>
                          </div>
                          <div class="icon-btn">
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

              <button class="add-field-btn" @click="addNewField">
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
              <div
                class="menu-item border-b"
                @click="editField(selectedField!)"
              >
                <div class="menu-item-content">
                  <el-icon><EditPen /></el-icon>
                  <span>编辑</span>
                </div>
              </div>
              <!-- <div
                class="menu-item border-t-b"
                @click="createGroup(selectedField!)"
              >
              <div class="menu-item-content">
                <el-icon><FolderAdd /></el-icon>
                <span>创建编组</span>
              </div>

              </div> -->
              <div
                class="menu-item delete"
                @click="deleteField(selectedField!)"
              >
                <div class="menu-item-content">
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <button class="toolbar-btn">
          <el-icon><Memo /></el-icon> 视图配置
        </button> -->
        <!-- 自定义按钮插槽 -->
        <slot name="toolbar-left"></slot>
        <div
          v-if="props.visibleButtons?.filter"
          class="filter-wrapper"
          ref="filterWrapper"
        >
          <button @click="toggleFilterPopup" class="toolbar-btn">
            <el-icon><Filter /></el-icon> 筛选
          </button>
          <div class="filter-popup" v-if="showFilterPopup">
            <div class="filter-popup-header">
              <div class="header-content">
                <h3>设置筛选条件</h3>
                <el-icon class="help-icon"><HelpFilled /></el-icon>
              </div>
              <button class="filter-popup-close" @click="closeFilterPopup">
                ×
              </button>
            </div>
            <div class="filter-popup-content">
              <!-- 筛选条件列表 -->
              <div
                v-for="(condition, index) in filterConditions"
                :key="index"
                class="filter-condition"
              >
                <div class="condition-select-wrapper">
                  <div class="condition-select" @click="toggleFieldMenu(index)">
                    <span>{{
                      getFieldName(condition.field) || "选择字段"
                    }}</span>
                    <el-icon :class="{ rotate: fieldMenus[index] }"
                      ><CaretBottom
                    /></el-icon>
                  </div>
                  <div v-if="fieldMenus[index]" class="condition-menu">
                    <div v-for="field in props.fields" :key="field.id">
                      <div
                        class="field-item sub-item"
                        :class="{ active: condition.field === field.field }"
                        @click="
                          (event) => selectFilterField(field, index, event)
                        "
                      >
                        <div class="field-item-content">
                          <div class="field-icon">
                            <div v-html="getIconForType(field.type)"></div>
                          </div>
                          <div class="field-name">{{ field.name }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="condition-select-wrapper">
                  <div
                    class="condition-select"
                    @click="toggleOperatorMenu(index)"
                  >
                    <span>{{ getOperatorLabel(condition.operator) }}</span>
                    <el-icon :class="{ rotate: operatorMenus[index] }"
                      ><CaretBottom
                    /></el-icon>
                  </div>
                  <div v-if="operatorMenus[index]" class="condition-menu">
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.operator === '=' }"
                      @click="selectOperator('=', index, $event)"
                    >
                      <div class="field-item-content">
                        <div class="field-name">等于</div>
                      </div>
                    </div>
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.operator === '!=' }"
                      @click="selectOperator('!=', index, $event)"
                    >
                      <div class="field-item-content">
                        <div class="field-name">不等于</div>
                      </div>
                    </div>
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.operator === 'contains' }"
                      @click="selectOperator('contains', index, $event)"
                    >
                      <div class="field-item-content">
                        <div class="field-name">包含</div>
                      </div>
                    </div>
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.operator === 'not_contains' }"
                      @click="selectOperator('not_contains', index, $event)"
                    >
                      <div class="field-item-content">
                        <div class="field-name">不包含</div>
                      </div>
                    </div>
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.operator === '>' }"
                      @click="selectOperator('>', index, $event)"
                    >
                      <div class="field-item-content">
                        <div class="field-name">大于</div>
                      </div>
                    </div>
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.operator === '<' }"
                      @click="selectOperator('<', index, $event)"
                    >
                      <div class="field-item-content">
                        <div class="field-name">小于</div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 输入框，动态渲染 -->
                <div class="condition-input" style="flex: 1">
                  <el-input
                    v-if="getFieldType(condition.field) === 'text'"
                    v-model="condition.value"
                    type="text"
                    class="search-input"
                    placeholder="请输入文本"
                  />
                  <el-date-picker
                    v-else-if="getFieldType(condition.field) === 'date'"
                    v-model="condition.value"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                  <el-input-number
                    v-else-if="getFieldType(condition.field) === 'number'"
                    v-model="condition.value"
                    placeholder="请输入数值"
                    style="width: 100%"
                  />
                  <!-- 用户选择 -->
                  <el-select
                    v-else-if="getFieldType(condition.field) === 'user'"
                    v-model="condition.value"
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
                  <!-- 下拉选择 -->
                  <el-select
                    v-else-if="getFieldType(condition.field) in FieldMenu"
                    v-model="condition.value"
                    :multiple="getFieldType(condition.field) === 'multiple'"
                    placeholder="请选择选项"
                    style="width: 100%"
                    class="el-items"
                  >
                    <el-option
                      v-for="opt in FieldMenu[
                        getFieldOptions(condition.field)
                      ] || []"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-checkbox
                    v-else-if="getFieldType(condition.field) === 'checkbox'"
                    v-model="condition.value"
                    class="check-box"
                    border
                  >
                    是
                  </el-checkbox>
                  <!-- 默认回退到 input -->
                  <el-input
                    v-else
                    v-model="condition.value"
                    type="text"
                    placeholder="请输入"
                  />
                </div>
                <button
                  class="remove-condition"
                  @click="(event) => removeFilterCondition(index, event)"
                >
                  <el-icon class="close-icon"><Close /></el-icon>
                </button>
              </div>

              <!-- 添加条件按钮 -->
              <button
                class="add-condition-btn"
                @click="addFilterCondition"
                style=""
              >
                <el-icon><Plus /></el-icon> 添加条件
              </button>
            </div>
            <div class="filter-popup-footer">
              <button class="cancel-btn" @click="resetFilter">重置</button>
              <button class="apply-btn" @click="applyFilter">应用</button>
            </div>
          </div>
        </div>
        <!-- <button class="toolbar-btn">
          <el-icon><OfficeBuilding /></el-icon> 分组
        </button> -->
        <div
          v-if="props.visibleButtons?.sort"
          class="sort-wrapper"
          ref="sortWrapper"
        >
          <button @click="toggleSortPopup" class="toolbar-btn">
            <el-icon><Sort /></el-icon> 排序
          </button>
          <div v-if="showSortPopup" class="filter-popup sort-popup">
            <div class="filter-popup-header">
              <h3>设置排序条件</h3>
              <button class="filter-popup-close" @click="showSortPopup = false">
                ×
              </button>
            </div>
            <div class="filter-popup-content">
              <div class="filter-condition">
                <div class="condition-select-wrapper">
                  <div class="condition-select" @click="toggleConditionMenu">
                    <span>{{
                      selectedCondition ? selectedCondition?.name : "选择条件"
                    }}</span>
                    <el-icon :class="{ rotate: showConditionMenu }"
                      ><CaretBottom
                    /></el-icon>
                  </div>
                  <div v-if="showConditionMenu" class="condition-menu">
                    <div v-for="field in props.fields" :key="field.id">
                      <div
                        class="field-item sub-item"
                        :class="{
                          active: selectedCondition?.field === field.field,
                        }"
                        @click="(event) => selectCondition(field, event)"
                      >
                        <div class="field-item-content">
                          <div class="field-icon">
                            <div v-html="getIconForType(field.type)"></div>
                          </div>
                          <div class="field-name">{{ field.name }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="sort-direction" v-if="selectedCondition">
                  <button
                    :class="{ active: sortDirection === 'asc' }"
                    @click="sortDirection = 'asc'"
                  >
                    A → Z
                  </button>
                  <button
                    :class="{ active: sortDirection === 'desc' }"
                    @click="sortDirection = 'desc'"
                  >
                    Z → A
                  </button>
                  <button
                    class="remove-condition"
                    @click="(event) => selectCondition(null, event)"
                  >
                    <el-icon class="close-icon"><Close /></el-icon>
                  </button>
                </div>
              </div>
            </div>
            <div class="filter-popup-footer">
              <button class="cancel-btn" @click="resetSort">取消</button>
              <button class="apply-btn" @click="applySort">应用</button>
            </div>
          </div>
        </div>
        <div
          v-if="props.visibleButtons?.lineHeight"
          class="line-height-wrapper"
          ref="lineHeightWrapper"
        >
          <button @click="toggleLineHeightMenu" class="toolbar-btn">
            <el-icon><Operation /></el-icon> 行高
          </button>
          <div class="line-height-popup" v-if="showLineHeightMenu">
            <div
              class="line-height-item"
              :class="{ active: currentLineHeight === 'low' }"
              @click="setLineHeight('low', $event)"
            >
              <div class="line-height-item-content">
                <div class="line-height-icon" v-html="lineHeightLowIcon"></div>
                <div>低</div>
              </div>
            </div>
            <div
              class="line-height-item"
              :class="{ active: currentLineHeight === 'medium' }"
              @click="setLineHeight('medium', $event)"
            >
              <div class="line-height-item-content">
                <div
                  class="line-height-icon"
                  v-html="lineHeightMediumIcon"
                ></div>
                <div>中等</div>
              </div>
            </div>
            <div
              class="line-height-item"
              :class="{ active: currentLineHeight === 'high' }"
              @click="setLineHeight('high', $event)"
            >
              <div class="line-height-item-content">
                <div class="line-height-icon" v-html="lineHeightHighIcon"></div>
                <div>高</div>
              </div>
            </div>
            <div
              class="line-height-item"
              :class="{ active: currentLineHeight === 'ultra-high' }"
              @click="setLineHeight('ultra-high', $event)"
            >
              <div class="line-height-item-content">
                <div
                  class="line-height-icon"
                  v-html="lineHeightUltraHighIcon"
                ></div>
                <div>超高</div>
              </div>
            </div>
          </div>
        </div>
        <!-- <button class="toolbar-btn">
          <el-icon><Picture /></el-icon> 填色
        </button> -->

        <div
          v-if="props.visibleButtons?.search"
          class="search-wrapper"
          ref="searchWrapper"
        >
          <div class="search-input-container">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词"
              size="small"
              class="search-input"
              :prefix-icon="Search"
              @keyup.enter="performSearch"
            />
          </div>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- 自定义按钮插槽（默认按钮前） -->
        <slot name="toolbar-right-before"></slot>

        <button v-if="props.visibleButtons?.help" class="toolbar-btn">
          <el-icon><HelpFilled /></el-icon>
        </button>
        <button v-if="props.visibleButtons?.log" class="toolbar-btn">
          <el-icon><Clock /></el-icon>
        </button>
        <button v-if="props.visibleButtons?.export" class="toolbar-btn">
          <el-icon><Tickets /></el-icon>生成表单
        </button>
        <!-- <button class="toolbar-btn">
          <el-icon><ChatDotSquare /></el-icon>
        </button> -->

        <!-- 自定义按钮插槽（默认按钮后） -->
        <slot name="toolbar-right-after"></slot>
      </div>
    </div>

    <!-- 字段编辑弹窗 -->
    <FieldEditDialog
      :visible="showEditDialog"
      :field="currentEditField || undefined"
      :position="fieldMenuPosition"
      @close="closeEditDialog"
      @confirm="confirmEditField"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from "vue";
  import { ElIcon, ElInput } from "element-plus";
  import {
    Close,
    Plus,
    Setting,
    Filter,
    Sort,
    Operation,
    Clock,
    Tickets,
    HelpFilled,
    EditPen,
    Delete,
    MoreFilled,
    View,
    Hide,
    Lock,
    CaretBottom,
    Search,
  } from "@element-plus/icons-vue";
  import {
    questionIcon,
    getIconForType,
    dragIcon,
    lineHeightLowIcon,
    lineHeightMediumIcon,
    lineHeightHighIcon,
    lineHeightUltraHighIcon,
  } from "@/utils/SvgIcons";
  import FieldEditDialog from "./FieldEditDialog.vue";
  import draggable from "vuedraggable/src/vuedraggable.js";
  import type { DynamicField } from "@/data/wbsFields";
  import {
    assigneeAvatars,
    priorityOptions,
    type SelectOption,
    statusOptions,
    taskTypeOptions,
  } from "@/data/wbsData.ts";

  // 定义props
  interface ToolbarProps {
    fields: Array<{
      id: number;
      name: string;
      field: string;
      type: string;
      invisible: boolean;
    }>;
    lineHeight?: "low" | "medium" | "high" | "ultra-high";
    visibleButtons?: {
      add?: { enable: boolean; name?: string };
      fieldConfig?: boolean;
      filter?: boolean;
      sort?: boolean;
      lineHeight?: boolean;
      help?: boolean;
      log?: boolean;
      export?: boolean;
      search?: boolean;
      edit?: boolean;
    };
    // 允许外部指定要搜索的字段
    searchFields?: string[];
  }

  // 使用defineProps接收外部传入的fields
  const props = defineProps<ToolbarProps>();

  const showFieldConfig = ref(false);
  const fieldConfigWrapper = ref<HTMLElement | null>(null);
  const showFieldContextMenu = ref(false);
  const selectedField = ref<DynamicField | null>(null);
  const fieldMenuPosition = ref({ left: 0, top: 0 });
  const showEditDialog = ref(false);
  const currentEditField = ref<DynamicField | null>(null);
  const draggableFields = ref<DynamicField[]>([]);
  const isDragging = ref(false);
  // 行高设置相关状态
  const showLineHeightMenu = ref(false);
  const currentLineHeight = ref<"low" | "medium" | "high" | "ultra-high">(
    props.lineHeight || "low",
  );
  const lineHeightWrapper = ref<HTMLElement | null>(null);
  const showSearchBox = ref(false); // 搜索框可见性
  const searchKeyword = ref(""); // 搜索关键词
  const searchWrapper = ref<HTMLElement | null>(null); // 搜索框包装器引用
  // 筛选功能相关状态
  const showFilterPopup = ref(false); // 筛选弹窗可见性
  const showSortPopup = ref(false); // 排序弹窗可见性
  const selectedCondition = ref<DynamicField | null>(null); // 选中的筛选条件
  const sortDirection = ref<"asc" | "desc">("asc"); // 排序方向
  const filterWrapper = ref<HTMLElement | null>(null); // 筛选包装器引用
  const sortWrapper = ref<HTMLElement | null>(null); // 排序包装器引用
  const showConditionMenu = ref(false);
  const fieldMenus = ref<boolean[]>([]);
  const operatorMenus = ref<boolean[]>([]); // 操作符菜单显示状态
  //下拉选择内容
  const FieldMenu: Record<string, SelectOption[]> = {
    tags: priorityOptions,
    progress: statusOptions,
    single: statusOptions,
    taskType: taskTypeOptions,
    taskProcess: taskTypeOptions,
  };
  // 新增：筛选条件数组
  interface FilterCondition {
    field: string;
    operator: string;
    value: string;
  }
  const filterConditions = ref<FilterCondition[]>([]);

  watch(
    () => props.fields,
    (newFields) => {
      if (newFields.length > 1) {
        draggableFields.value = [...newFields.slice(1)];
      }
    },
    { immediate: true },
  );

  // 定义事件
  const $emit = defineEmits<{
    (e: "close"): void;
    (e: "fieldSelected", field: DynamicField): void;
    (e: "addField"): void;
    (e: "updateFieldVisibility", fieldId: number, invisible: boolean): void;
    (e: "updateField", fieldId: number, data: any): void;
    (e: "fieldReordered", fields: DynamicField[]): void;
    (
      e: "lineHeightChanged",
      lineHeight: "low" | "medium" | "high" | "ultra-high",
    ): void;
    (e: "addRecord", data: Record<string, any>): void; // 添加新记录事件
    (e: "search", keyword: string, searchFields?: string[]): void; // 搜索事件，支持传入搜索字段
    (e: "filter", conditions: FilterCondition[]): void;
    (
      e: "sort",
      condition: DynamicField | null,
      direction: "asc" | "desc",
    ): void;
    (e: "openAddRecordDialog"): void;
  }>();

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

      console.log(
        "字段顺序已更新:",
        reorderedFields.map((f) => f.name),
      );
      $emit("fieldReordered", reorderedFields);
    }
  };

  const toggleFieldHidden = (field: DynamicField, invisible: boolean) => {
    $emit("updateFieldVisibility", field.id, invisible);
  };

  // 选择字段
  const selectField = (field: DynamicField) => {
    $emit("fieldSelected", field);
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
    console.log("Edit field:", field.name);
    showFieldContextMenu.value = false;
    currentEditField.value = field;
    showEditDialog.value = true;
  };

  // 关闭编辑对话框
  const closeEditDialog = () => {
    showEditDialog.value = false;
    showFieldConfig.value = true;
    currentEditField.value = null;
  };

  // 确认编辑字段
  const confirmEditField = (data: any) => {
    console.log("Confirm edit field with data:", data);
    if (!data) {
      console.error("No data provided for confirmEditField");
      closeEditDialog();
      return;
    }

    // 更新字段配置和列表数据
    if (currentEditField.value) {
      const editField = currentEditField.value;

      // 更新本地字段数据
      const fieldIndex = props.fields.findIndex((f) => f.id === editField.id);
      if (fieldIndex !== -1) {
        // 创建更新后的字段数据
        const updatedField = {
          ...editField,
          name: data.title !== undefined ? data.title : editField.name,
          type: data.fieldType !== undefined ? data.fieldType : editField.type,
        };

        // 2. 更新draggableFields中的数据（如果是可拖拽字段）
        if (fieldIndex > 0) {
          const draggableIndex = fieldIndex - 1;
          if (
            draggableIndex >= 0 &&
            draggableIndex < draggableFields.value.length
          ) {
            draggableFields.value = draggableFields.value.map((field, index) =>
              index === draggableIndex ? updatedField : field,
            );
            draggableFields.value = [...draggableFields.value];
          }
        }

        if (editField.id !== undefined) {
          $emit("updateField", editField.id, updatedField);
        }
      }
    }

    closeEditDialog();
  };

  // 创建编组
  // const createGroup = (field: DynamicField) => {
  //   console.log("Create group for field:", field.name);
  //   showFieldContextMenu.value = false;
  // };

  // 删除字段
  const deleteField = (field: DynamicField) => {
    console.log("Delete field:", field.name);
    showFieldContextMenu.value = false;
    // 实际项目中这里会显示确认对话框并执行删除操作
  };

  // 添加新字段
  const addNewField = () => {
    $emit("addField");
  };

  // 切换字段配置显示状态
  const toggleFieldConfig = () => {
    showFieldConfig.value = !showFieldConfig.value;
  };

  // 关闭字段配置
  const closeFieldConfig = () => {
    showFieldConfig.value = false;
    showFieldContextMenu.value = false;
    $emit("close");
  };
  // 打开添加记录对话框
  const openAddRecordDialog = () => {
    $emit("openAddRecordDialog");
  };

  // 执行搜索
  const performSearch = () => {
    const keyword = searchKeyword.value.trim();
    console.log("Search keyword:", keyword);
    console.log("Search fields:", props.searchFields);
    // 将搜索关键词和指定的搜索字段一起传递给父组件
    $emit("search", keyword, props.searchFields);
  };

  // 切换筛选弹窗显示状态
  const toggleFilterPopup = () => {
    showFilterPopup.value = !showFilterPopup.value;
  };
  // 切换排序弹窗显示状态
  const toggleSortPopup = () => {
    showSortPopup.value = !showSortPopup.value;
    showConditionMenu.value = false;
  };

  // 切换条件菜单显示状态
  const toggleConditionMenu = () => {
    setTimeout(() => {
      showConditionMenu.value = !showConditionMenu.value;
      showSortPopup.value = true;
    }, 200);
  };

  // 获取条件标签
  const getConditionLabel = (value: string) => {
    const labels: Record<string, string> = {
      task1: "任务描述1",
      task2: "任务情况总结",
      assignee: "任务执行人",
      startDate: "开始日期",
      endDate: "预计完成日期",
      progress: "进展",
      delay: "是否延期",
    };
    return labels[value] || "";
  };

  // 选择条件
  const selectCondition = (value: any, event?: MouseEvent) => {
    // 阻止事件冒泡，防止触发handleClickOutside关闭排序弹窗
    if (event) {
      event.stopPropagation();
    }
    // 处理传入field对象的情况
    const conditionValue = value;
    selectedCondition.value = conditionValue;
    console.log("Selected condition:", conditionValue);

    // 当清除条件时，确保排序弹窗保持打开状态
    if (conditionValue === "") {
      showSortPopup.value = true;
    }
  };

  // 重置筛选条件
  const resetFilter = () => {
    filterConditions.value = [];
    fieldMenus.value = [];
    // 保留弹窗打开状态，只重置筛选条件
  };
  const resetSort = () => {
    selectedCondition.value = null;
    sortDirection.value = "asc";
    showSortPopup.value = false;
  };

  // 添加筛选条件
  const addFilterCondition = () => {
    filterConditions.value.push({
      field: "",
      operator: "=",
      value: "",
    });
    fieldMenus.value.push(false);
    operatorMenus.value.push(false);
  };

  // 切换字段菜单显示
  const toggleFieldMenu = (index: number) => {
    // 关闭其他所有菜单
    fieldMenus.value = fieldMenus.value.map((_, i) =>
      i === index ? !fieldMenus.value[i] : false,
    );
    // 关闭所有操作符菜单
    operatorMenus.value = operatorMenus.value.map(() => false);
  };

  // 切换操作符菜单显示
  const toggleOperatorMenu = (index: number) => {
    // 关闭其他所有菜单
    operatorMenus.value = operatorMenus.value.map((_, i) =>
      i === index ? !operatorMenus.value[i] : false,
    );
    // 关闭所有字段菜单
    fieldMenus.value = fieldMenus.value.map(() => false);
  };

  // 选择筛选字段
  const selectFilterField = (
    field: DynamicField,
    index: number,
    event: MouseEvent,
  ) => {
    filterConditions.value[index].field = field.field;
    filterConditions.value[index].value = "";
    fieldMenus.value[index] = false;
    event.stopPropagation();
  };

  // 获取字段名称
  const getFieldName = (fieldName: string): string | undefined => {
    const field = props.fields.find((f) => f.field === fieldName);
    return field?.name;
  };
  // 根据字段名获取类型
  const getFieldType = (field: string): string => {
    const f = props.fields.find((f) => f.field === field);
    return f ? f.type : "text";
  };
  // 获取下拉字段类型
  const getFieldOptions = (field: string): string => {
    const f = props.fields.find((f) => f.field === field);
    return f ? f.field : "";
  };
  // 获取操作符显示标签
  const getOperatorLabel = (operator: string): string => {
    const labels: Record<string, string> = {
      "=": "等于",
      "!=": "不等于",
      contains: "包含",
      not_contains: "不包含",
      ">": "大于",
      "<": "小于",
    };
    return labels[operator] || "等于";
  };

  // 选择操作符
  const selectOperator = (
    operator: string,
    index: number,
    event?: MouseEvent,
  ) => {
    filterConditions.value[index].operator = operator;
    operatorMenus.value[index] = false;
    // 阻止事件冒泡，防止触发handleClickOutside关闭整个筛选弹窗
    if (event) {
      event.stopPropagation();
    }
  };

  // 删除筛选条件
  const removeFilterCondition = (index: number, event?: MouseEvent) => {
    // 阻止事件冒泡，防止触发handleClickOutside关闭整个筛选弹窗
    if (event) {
      event.stopPropagation();
    }
    filterConditions.value.splice(index, 1);
    fieldMenus.value.splice(index, 1);
    operatorMenus.value.splice(index, 1);
  };

  // 应用筛选条件
  const applyFilter = () => {
    // 过滤掉未完成的条件
    const validConditions = filterConditions.value.filter(
      (condition) => condition.field && condition.value,
    );

    // 更新filterConditions，只保留有效的条件，确保下次打开弹窗时自动清除未选择项
    filterConditions.value = validConditions;

    if (validConditions.length > 0) {
      $emit("filter", validConditions);
    }
    showFilterPopup.value = false;
  };

  // 关闭筛选弹窗并清理未选择的字段
  const closeFilterPopup = () => {
    // 清理未选择的字段
    const validConditions = filterConditions.value.filter(
      (condition) => condition.field && condition.value,
    );

    // 更新filterConditions，只保留有效的条件
    filterConditions.value = validConditions;

    // 关闭弹窗
    showFilterPopup.value = false;
  };
  // 应用排序条件
  const applySort = () => {
    if (selectedCondition.value) {
      $emit("sort", selectedCondition.value, sortDirection.value);
    }
    showSortPopup.value = false;
  };

  // 处理搜索输入框的回车事件
  const handleSearchKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      performSearch();
    }
  };
  // 点击外部关闭弹出层和上下文菜单
  const handleClickOutside = (event: MouseEvent) => {
    console.log("Click outside");
    const target = event.target as HTMLElement;

    // 如果点击在 element-plus 的浮层内部，就不关闭筛选框
    const isInElPopper =
      target.closest(".el-select-dropdown") ||
      target.closest(".el-picker-panel") ||
      target.closest(".el-tooltip__popper");

    if (isInElPopper) {
      return; // 阻止继续执行关闭逻辑
    }
    // 检查是否点击在FieldConfigPopup组件内部
    const isClickInFieldConfigPopup = (event.target as Element).closest(
      ".field-config-popup",
    );

    if (
      fieldConfigWrapper.value &&
      !fieldConfigWrapper.value.contains(event.target as Node) &&
      !isClickInFieldConfigPopup &&
      !showEditDialog.value
    ) {
      closeFieldConfig();
    }
    // 关闭上下文菜单
    showFieldContextMenu.value = false;

    // 只有当点击目标不在行高菜单内部时，才关闭行高菜单
    if (
      lineHeightWrapper.value &&
      !lineHeightWrapper.value.contains(event.target as Node)
    ) {
      showLineHeightMenu.value = false;
    }

    // 只有当点击目标不在搜索框内部时，才关闭搜索框
    if (
      searchWrapper.value &&
      !searchWrapper.value.contains(event.target as Node)
    ) {
      showSearchBox.value = false;
    }

    // 检查是否点击在筛选弹窗内部
    const isClickInFilterPopup = (event.target as Element).closest(
      ".filter-popup",
    );

    // 只有当点击目标不在筛选弹窗内部时，才关闭筛选弹窗
    if (
      filterWrapper.value &&
      !filterWrapper.value.contains(event.target as Node)
    ) {
      showFilterPopup.value = false;
      // 关闭所有字段菜单和操作符菜单
      fieldMenus.value = fieldMenus.value.map(() => false);
      operatorMenus.value = operatorMenus.value.map(() => false);
    }

    // 如果点击在筛选弹窗内部但不在任何条件菜单上，关闭所有菜单
    if (isClickInFilterPopup) {
      const isClickInConditionMenu = (event.target as Element).closest(
        ".condition-menu",
      );
      const isClickInConditionSelect = (event.target as Element).closest(
        ".condition-select",
      );

      // 如果点击不在条件菜单和条件选择器上，关闭所有字段菜单和操作符菜单
      if (!isClickInConditionMenu && !isClickInConditionSelect) {
        fieldMenus.value = fieldMenus.value.map(() => false);
        operatorMenus.value = operatorMenus.value.map(() => false);
      }
    }
    // 关闭排序弹窗
    if (
      sortWrapper.value &&
      !sortWrapper.value.contains(event.target as Node)
    ) {
      showSortPopup.value = false;
      showConditionMenu.value = false;
    }
    // 如果点击不在条件菜单内部，关闭条件菜单
    if (showConditionMenu.value && sortWrapper.value) {
      const conditionMenu = sortWrapper.value.querySelector(".condition-menu");
      if (conditionMenu && !conditionMenu.contains(event.target as Node)) {
        showConditionMenu.value = false;
      }
    }
  };

  // 切换行高菜单显示状态
  const toggleLineHeightMenu = () => {
    showLineHeightMenu.value = !showLineHeightMenu.value;
  };

  // 设置行高
  const setLineHeight = (
    lineHeight: "low" | "medium" | "high" | "ultra-high",
    event?: MouseEvent,
  ) => {
    // 阻止事件冒泡，防止触发handleClickOutside关闭菜单
    if (event) {
      event.stopPropagation();
    }
    currentLineHeight.value = lineHeight;
    // showLineHeightMenu.value = false;
    $emit("lineHeightChanged", lineHeight);
    console.log(`行高已设置为: ${lineHeight}`);
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

  .toolbar-container {
    .toolbar {
      background: #fff;
      padding: 9px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .toolbar-btn {
        border: none;
        background: #fff;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: $text-color;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 4px;

        .icon {
          font-size: 16px;
        }

        &:hover {
          color: $primary-color;
          border-color: $primary-color;
          background: $hover-bg;
        }

        &.active {
          color: $primary-color;
          border-color: $primary-color;
          background: $hover-bg;
        }
      }
      .toolbar-btn-add {
        color: $primary-color;
      }
    }

    .search-box {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      .search-input {
        width: 300px;
        padding: 8px 12px;
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px $hover-bg;
        }
      }

      .search-btn {
        padding: 8px 16px;
        background: $primary-color;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
          background: #40a9ff;
        }
      }
    }

    .table-container {
      width: 100%;
      height: calc(100vh - 280px);
      overflow: hidden;
      background-color: white;
      margin-top: 16px;
    }

    // 概览页面样式
    .overview-content {
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    .overview-content h3 {
      color: $text-color;
      margin-bottom: 16px;
      font-size: 1.2rem;
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: #fff;
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 600;
      color: $primary-color;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: $light-text;
    }

    .stat-percentage {
      font-size: 12px;
      color: $success-color;
      margin-top: 4px;
    }

    .priority-chart {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .priority-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #fff;
      border: 1px solid $border-color;
      border-radius: 6px;
    }

    .priority-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      margin-right: 8px;
    }

    .priority-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
    }

    .priority-label {
      font-size: 14px;
      color: $text-color;
    }

    .priority-count {
      font-size: 16px;
      font-weight: 600;
      color: $primary-color;
    }

    // 团队成员页面样式
    .team-content {
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    .team-content h3 {
      color: $text-color;
      margin-bottom: 16px;
      font-size: 1.2rem;
    }

    .team-members {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .developer-card {
      background: #fff;
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    }

    .developer-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .developer-avatar {
      font-size: 24px;
      margin-right: 8px;
    }

    .developer-name {
      font-size: 16px;
      font-weight: 600;
      color: $text-color;
    }

    .developer-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .developer-task-count {
      font-size: 14px;
      color: $text-color;
    }

    .task-count {
      font-weight: 600;
      color: $primary-color;
    }

    .developer-task-breakdown {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .task-status.completed {
      color: $success-color;
      background: #f6ffed;
    }

    .task-status.in-progress {
      color: $primary-color;
      background: #e6f7ff;
    }

    .task-status.pending {
      color: $light-text;
      background: #f5f5f5;
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
  }

  .field-config-wrapper {
    position: relative;
    display: inline-block;
  }

  .line-height-wrapper {
    position: relative;
    display: inline-block;
  }

  .search-wrapper {
    position: relative;
    display: inline-block;
    margin-left: 5px;
  }

  .search-popup {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    z-index: 1000;
    border: 1px solid #dee0e3;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    background: white;
    padding: 12px;
  }

  .search-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .search-input {
    width: 200px;
  }

  .search-btn {
    padding: 8px 16px;
    background: $primary-color;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
  }

  .search-btn:hover {
    background: #40a9ff;
  }

  .filter-wrapper {
    position: relative;
    display: inline-block;
  }

  .sort-wrapper {
    position: relative;
    display: inline-block;
  }

  .filter-popup {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    z-index: 1000;
    border: 1px solid #dee0e3;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    background: white;
    width: 570px;
    .field-item {
      cursor: pointer !important;
    }
  }
  .sort-popup {
    width: 370px !important;
  }

  .filter-popup-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-popup-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .filter-popup-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #909399;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .filter-popup-close:hover {
    color: #606266;
  }

  .filter-popup-content {
    padding: 16px;
  }

  .filter-condition {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }

  .condition-select-wrapper {
    position: relative;
    width: 150px;
    display: flex;
  }

  .condition-select {
    width: 100%;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #dee0e3;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: border-color 0.2s;
  }

  .condition-select:hover {
    border-color: #c0c4cc;
  }

  .condition-select .el-icon {
    transition: transform 0.2s;
    font-size: 12px;
    color: #8f959e;
  }

  .condition-select .rotate {
    transform: rotate(180deg);
  }

  .add-condition-btn {
    margin-top: 8px;
    padding: 4px;
    color: #646a73 !important;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    border-radius: 4px;
  }
  .add-condition-btn:hover {
    background-color: rgba(31, 35, 41, 0.1);
  }
  .condition-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    z-index: 1001;
    background: white;
    border: 1px solid #dee0e3;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    min-width: 150px;
    max-height: 200px;
    overflow-y: auto;
    padding: 8px;
  }

  .condition-menu-item {
    padding: 5px 6px;
    height: 32px;
    font-size: 14px;
    color: #1f2329;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s;
  }

  .condition-menu-item-content {
    padding: 6px;
    border-radius: 4px;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .condition-menu-item-content:hover {
    background-color: rgba(31, 35, 41, 0.1);
  }

  .condition-menu-item.active .condition-menu-item-content {
    color: #409eff;
    background-color: #ecf5ff;
  }

  /* 条件菜单中的字段项样式优化 */
  .condition-menu .field-item.sub-item {
    padding: 0 !important;
    margin: 0;
    border: none;
    background: none;
    height: auto;
  }

  .condition-menu .field-item-content {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    margin: 0;
    width: 100%;
  }

  .condition-menu .field-item:hover .field-item-content {
    background-color: rgba(31, 35, 41, 0.1);
  }
  /* 激活状态样式 */
  .condition-menu .field-item.active .field-item-content {
    background-color: rgba(31, 35, 41, 0.1);
  }

  .condition-menu .field-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .condition-menu .field-name {
    font-size: 14px;
    color: #1f2329;
    flex: 1;
  }

  .sort-direction {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sort-direction button {
    padding: 4px 6px;
    border: none;
    background: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .sort-direction button.active {
    background: #1890ff;
    color: white;
    border-color: #1890ff;
  }

  .sort-direction button:hover:not(.active) {
    border-color: #1890ff;
    color: #1890ff;
  }

  .remove-condition {
    padding: 4px 6px;
    border: none;
    background: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .close-icon {
    margin-top: 2px;
  }

  .remove-condition:hover {
    background: rgba(31, 35, 41, 0.1) !important;
    color: #606266 !important;
  }

  .filter-popup-footer {
    padding: 12px 16px;
    border-top: 1px solid #e8e8e8;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .cancel-btn,
  .apply-btn {
    padding: 8px 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .cancel-btn {
    background: white;
    color: #606266;
  }

  .cancel-btn:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background: #ecf5ff;
  }

  .apply-btn {
    background: #1890ff;
    color: white;
    border-color: #1890ff;
  }

  .apply-btn:hover {
    background: #40a9ff;
    border-color: #40a9ff;
  }

  .line-height-popup {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    border: 1px solid #dee0e3;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    background: white;
    width: 130px;
    padding: 6px 0;
  }

  .line-height-item {
    cursor: pointer;
    font-size: 14px;
    color: #646a73;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 6px;
  }

  .line-height-item-content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border-radius: 4px;
    .line-height-icon {
      display: flex;
      align-items: center;
    }
  }

  .line-height-item-content:hover {
    background-color: rgba(31, 35, 41, 0.1);
  }

  .line-height-item.active {
    color: #1890ff;
  }

  .field-config-popup {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    z-index: 1000;
    border: 1px solid #dee0e3;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    background: white;
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

  .menu-item el-icon {
    margin-right: 6px;
    font-size: 14px;
  }

  .field-config-dialog {
    width: 260px;
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
      padding: 6px 5px 6px 2px;
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
  /* 拖拽相关样式 */
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

  /* 鼠标悬停在整行时显示拖拽图标 */
  .field-item:hover .drag-handle {
    opacity: 0.5;
  }

  /* 拖拽时隐藏所有图标 */
  .field-item.dragging .drag-handle,
  .field-item.dragging .field-actions,
  .field-item.dragging .field-icon {
    opacity: 0 !important;
  }

  /* 全局拖拽状态下隐藏所有节点的拖拽图标 */
  .draggable-list.is-dragging .drag-handle {
    opacity: 0 !important;
  }

  /* 拖拽过程中的样式 */
  .draggable-list .field-item {
    transition: background-color 0.2s;
    position: relative;
  }

  .draggable-list .field-item:hover {
    background-color: #fff;
  }

  /* 拖拽时的ghost元素样式 - 设置为横线定位样式，隐藏文本内容，并添加小箭头 */
  .draggable-list .ghost-class {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    height: 8px !important; /* 增加高度以容纳箭头 */
    padding: 0 0 0 12px !important; /* 为箭头留出更多空间 */
    margin: 0 6px !important;
    background-image: linear-gradient(to right, #1890ff, #1890ff) !important;
    background-size: 100% 1px !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    /* 隐藏所有内容 */
    overflow: hidden !important;
    text-indent: -9999px !important;
    color: transparent !important;
    min-height: 8px !important; /* 确保有足够高度 */
    max-height: 8px !important;
    white-space: nowrap !important;
    position: relative !important;
    z-index: 10 !important; /* 确保在最上层显示 */
  }

  /* 在蓝线前面添加小箭头 - 增大尺寸并改进样式，调整箭头方向 */
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
    border-left: 6px solid #1890ff !important; /* 修改为向左的箭头 */
    z-index: 11 !important; /* 确保箭头在最上层 */
  }

  /* 确保ghost元素内部所有子元素也不显示 */
  .draggable-list .ghost-class * {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  /* 拖拽时的chosen元素样式 - 拖拽项在原位显示灰色 */
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
  .border-b {
    border-bottom: 1px solid rgba(31, 35, 41, 0.15);
  }

  .field-item:hover {
    background-color: #fff;
    transition: background-color 0.2s;
  }

  .field-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    line-height: 8px;
  }

  .field-name {
    font-size: 14px;
    flex-shrink: 1;
    font-size: 14px;
    margin-left: 0;
    overflow: hidden;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .field-actions {
    display: flex;
    gap: 12px;
    .icon-btn {
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 3px;
      &:hover {
        cursor: pointer;
        background-color: rgba(31, 35, 41, 0.1);
      }
    }
  }

  .action-btn {
    cursor: pointer;
    color: #8a8a8a;
    font-size: 16px;
  }

  .action-btn:hover {
    color: #1890ff;
  }

  .add-field-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-top: 1px solid rgba(31, 35, 41, 0.15);
    background: none;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: #2b2f36;
  }

  .add-field-btn:hover {
    background-color: #f5f6f7;
  }

  .add-icon {
    margin-right: 6px;
    font-size: 16px;
  }
  .check-box {
    width: 200px;
  }
</style>
