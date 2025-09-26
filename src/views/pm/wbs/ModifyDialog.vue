<template>
  <el-dialog
    v-model="props.visible"
    :title="dialogTitle"
    width="600px"
    :modal="false"
  >
    <div class="batch-modify-content">
      <!-- 批量修改属性 -->
      <div v-if="dialogType === 'properties'">
        <div class="batch-modify-header">
          <span class="hint"
            >您已选择批量修改
            {{ selectedCount }} 个任务的属性，请继续选择具体属性及操作</span
          >
        </div>

        <div class="batch-modify">
          <div class="batch-header">示例项目</div>
          <div class="batch-modify-fields-wrapper">
            <div class="batch-modify-fields">
              <span>任务{{ selectedCount }}个</span>
            </div>
            <!-- 筛选条件列表 -->
            <div
              v-for="(condition, index) in modifyConditions"
              :key="index"
              class="filter-condition"
            >
              <div class="condition-select-wrapper">
                <div class="condition-select" @click="toggleFieldMenu(index)">
                  <span>{{ getFieldName(condition.field) || "选择字段" }}</span>
                  <el-icon :class="{ rotate: fieldMenus[index] }"
                    ><CaretBottom
                  /></el-icon>
                </div>
                <div v-if="fieldMenus[index]" class="condition-menu">
                  <div v-for="field in props.fields" :key="field.id">
                    <div
                      class="field-item sub-item"
                      :class="{ active: condition.field === field.field }"
                      @click="(event) => selectModifyField(field, index, event)"
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
                    class="field-item sub-indent"
                    :class="{ active: condition.operator === '=' }"
                    @click="selectOperator('=', index, $event)"
                  >
                    <div class="field-item-content">
                      <div class="field-name">修改为</div>
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
                    v-for="opt in getFieldOptions(condition.field) || []"
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
                @click="(event) => removeModifyCondition(index, event)"
              >
                <el-icon class="close-icon"><Close /></el-icon>
              </button>
            </div>

            <!-- 添加条件按钮 -->
            <button
              class="add-condition-btn"
              @click="addModifyCondition"
              style=""
            >
              <el-icon><Plus /></el-icon> 添加属性
            </button>
          </div>
        </div>
      </div>

      <!-- 批量修改类型 -->
      <div v-else-if="dialogType === 'type'">
        <div class="batch-modify-header">
          <p class="hint">需要变更的工作项类型为：{{ targetType }}</p>
          <p class="hint">请为每个类型分别制定目标类型</p>
          <p class="note">注意! 类型变更后结构字段和部分字段的值将被置空</p>
        </div>

        <div class="batch-modify">
          <div class="batch-header">示例项目</div>
          <div class="batch-modify-fields-wrapper">
            <div class="type-selection">
              <div class="type-selection-info">
                <span>任务{{ selectedCount }}</span>
                <span>{{ selectedCount }}个工作项</span>
              </div>
              <span>-></span>
              <el-select
                v-model="selectedType"
                placeholder="请选择目标类型"
                style="width: 45%"
              >
                <el-option
                  v-for="type in typeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">下一步</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="showSure"
    title="批量操作"
    width="400px"
    :align-center="true"
  >
    <div>
      <p class="hint">确定要批量操作吗？</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleNoSure">取消</el-button>
        <el-button type="primary" @click="handleSure">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { CaretBottom, Close, Plus } from "@element-plus/icons-vue";
  import { getIconForType } from "@/utils/SvgIcons.ts";
  import type { DynamicField } from "@/data/wbsFields.ts";
  import {
    assigneeAvatars,
    priorityOptions,
    statusOptions,
    taskTypeOptions,
  } from "@/data/wbsData.ts";

  // 下拉选择内容
  const FieldMenu = {
    tags: priorityOptions,
    progress: statusOptions,
    single: statusOptions,
    taskType: taskTypeOptions,
    taskProcess: taskTypeOptions,
  };

  interface ModifyCondition {
    field: string;
    operator: string;
    value: any;
  }

  // 对话框状态
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: "properties",
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
    targetType: {
      type: String,
      default: "",
    },
    fields: {
      type: Array as () => DynamicField[],
      default: () => [],
    },
    typeOptions: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(["close:modify", "confirm", "cancel"]);

  // 对话框标题
  const dialogTitle = computed(() => {
    return props.dialogType === "properties" ? "批量修改属性" : "批量修改类型";
  });

  // 选中的类型
  const selectedType = ref("");

  // 修改条件数组
  const modifyConditions = ref<ModifyCondition[]>([
    { field: "", operator: "=", value: "" },
  ]);

  // 字段菜单显示状态
  const fieldMenus = ref<boolean[]>([false]);
  const operatorMenus = ref<boolean[]>([false]);
  const showSure = ref(false);

  // 关闭对话框
  const handleClose = () => {
    //清空所有数据
    modifyConditions.value = [{ field: "", operator: "=", value: "" }];
    selectedType.value = "";
    fieldMenus.value = [false];
    operatorMenus.value = [false];
    emit("close:modify", false);
  };

  // 取消操作
  const handleCancel = () => {
    emit("cancel");
    handleClose();
  };

  // 确认操作
  const handleConfirm = () => {
    showSure.value = true;
  };
  const handleSure = () => {
    const data = {
      type: props.dialogType,
      selectedType: selectedType.value,
      conditions: modifyConditions.value,
    };
    emit("confirm", data);
    handleClose();
  };
  const handleNoSure = () => {
    showSure.value = false;
  };

  // 添加修改条件
  const addModifyCondition = () => {
    modifyConditions.value.push({ field: "", operator: "=", value: "" });
    fieldMenus.value.push(false);
    operatorMenus.value.push(false);
  };

  // 删除修改条件
  const removeModifyCondition = (index: number, event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    modifyConditions.value.splice(index, 1);
    fieldMenus.value.splice(index, 1);
    operatorMenus.value.splice(index, 1);
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

  // 选择修改字段
  const selectModifyField = (
    field: DynamicField,
    index: number,
    event: MouseEvent,
  ) => {
    modifyConditions.value[index].field = field.field;
    fieldMenus.value[index] = false;
    event.stopPropagation();
  };

  // 选择操作符
  const selectOperator = (
    operator: string,
    index: number,
    event: MouseEvent,
  ) => {
    modifyConditions.value[index].operator = operator;
    operatorMenus.value[index] = false;
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

  // 获取字段选项
  const getFieldOptions = (field: string) => {
    return FieldMenu[field as keyof typeof FieldMenu];
  };

  // 获取操作符标签
  const getOperatorLabel = (operator: string): string => {
    const labels: Record<string, string> = {
      "=": "修改为",
    };
    return labels[operator] || "";
  };
</script>

<style scoped lang="scss">
  .batch-modify-header {
    margin-bottom: 20px;

    .hint {
      color: #999;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .note {
      color: #f56c6c;
      font-size: 12px;
    }
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

  .field-item {
    cursor: pointer !important;
  }

  .field-item-content {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    margin: 0;
  }

  .field-item:hover .field-item-content {
    background-color: rgba(31, 35, 41, 0.1);
  }

  .field-item.active .field-item-content {
    background-color: rgba(31, 35, 41, 0.1);
  }

  .field-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .field-name {
    font-size: 14px;
    color: #1f2329;
    flex: 1;
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

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .sub-item {
    padding: 0 4px !important;
  }
  .condition-menu .field-item.sub-item {
    padding: 0 !important;
    margin: 0;
    border: none;
    background: none;
    height: auto;
  }
  .batch-header {
    background-color: #f5f6f8;
    display: flex;
    height: 30px;
    align-items: center;
    font-weight: bold;
    font-size: 12px;
    padding: 5px 10px;
  }
  .batch-modify-fields {
    font-size: 12px;
    margin: 5px;
  }
  .batch-modify {
    border: 1px solid #dcdfe6;
  }
  .batch-modify-fields-wrapper {
    padding: 5px;
  }
  .type-selection {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .type-selection-info {
    width: 44%;
    border: 1px solid #dcdfe6;
    height: 32px;
    line-height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
  }
</style>
