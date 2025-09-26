<template>
  <div class="tree-table-container">
    <div ref="tableContainer" class="table-container"></div>
    <MoreActionsPopup
      :visible="showMoreActionsPopup"
      :position="moreActionsPopupPosition"
      :actions="moreActions"
      @close="closeMoreActionsPopup"
      @action="handleMoreAction"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, watch, computed, inject } from "vue";
  import * as VTable from "@visactor/vtable";
  import * as VTableEditors from "@visactor/vtable-editors";

  import { ElementPlusDateEditor } from "@/components/ElementPlusDateEditor.ts";
  import { CLSelectEditor } from "@/components/CLSelectEditor.ts";
  import {
    getIconForType,
    settingIcon,
    plusIcon,
    viewIcon,
    moreIcon,
  } from "@/utils/SvgIcons";
  import MoreActionsPopup from "@/components/MoreActionsPopup.vue";
  import {
    statusOptions,
    priorityColors,
    statusColors,
    priorityOptions,
  } from "@/data/wbsData";
  import type { DynamicField } from "@/data/wbsFields";
  import { fields } from "@visactor/vdataset";
  import type { LifeCycleEntity } from "@/interface/lifecycle.ts";

  // 定义props
  interface TableProps {
    fields: DynamicField[];
    activeTab?: number;
    // 从父组件传递的初始数据
    initialData?: LifeCycleEntity[];
    // 行高设置
    lineHeight?: "low" | "medium" | "high" | "ultra-high";
    // 增删改钩子函数
    onAddNode?: (parentNode: LifeCycleEntity, newNode: LifeCycleEntity) => void;
    onDeleteNode?: (node: LifeCycleEntity) => void;
    onUpdateNode?: (node: LifeCycleEntity, field: string, value: any) => void;
  }

  // 接收props
  const props = defineProps<TableProps>();

  // 定义事件
  const emit = defineEmits<{
    handleMoreAction: [node: LifeCycleEntity, actionKey: string];
    "update:initialData": [data: LifeCycleEntity[]];
    "node-selected": [nodes: LifeCycleEntity[]];
    "show:records": [nodes: LifeCycleEntity[]];
    "show:parentRecord": [record: LifeCycleEntity];
  }>();

  // 容器引用
  const tableContainer = ref<HTMLDivElement | null>(null);
  let tableInstance: any = null;
  const searchKeyword = ref("");
  const originalData = ref<LifeCycleEntity[]>([]);

  // 从父组件注入显示字段配置弹窗的函数
  const showFieldConfigPopup = inject<
    (position: { left: number; top: number }) => void
  >("showFieldConfigPopup");

  // 定义moreIcon悬浮窗相关状态
  const showMoreActionsPopup = ref(false);
  const moreActionsPopupPosition = ref({ left: 0, top: 0 });
  const selectedNode = ref<LifeCycleEntity | null>(null);
  const currentRowIndex = ref(-1);
  const currentColIndex = ref(-1);

  // 定义更多操作菜单
  const moreActions = ref([
    { key: "edit", label: "编辑", permission: true },
    { key: "delete", label: "删除", permission: true },
    { key: "copy", label: "复制", permission: true },
  ]);

  const updatePopupPositionOnScrollOrResize = () => {
    if (
      showMoreActionsPopup.value &&
      currentRowIndex.value >= 0 &&
      currentColIndex.value >= 0 &&
      tableInstance
    ) {
      try {
        const rect = tableInstance.getCellRect(
          currentColIndex.value,
          currentRowIndex.value,
        );
        const tableRect = tableContainer.value?.getBoundingClientRect();

        if (rect && tableRect) {
          const leftPos =
            (tableRect.left || 0) +
            (rect.x || 0) +
            (rect.width || 0) -
            20 +
            (window.scrollX || 0);
          const topPos =
            (tableRect.top || 0) +
            (rect.y || 0) +
            (rect.height || 0) / 2 +
            (window.scrollY || 0);

          const popupWidth = 160;
          const popupHeight = 200;

          let adjustedLeft = leftPos;
          let adjustedTop = topPos;

          if (adjustedLeft + popupWidth > window.innerWidth) {
            adjustedLeft = window.innerWidth - popupWidth - 10;
          }
          if (adjustedLeft < 0) {
            adjustedLeft = 10;
          }
          if (adjustedTop + popupHeight > window.innerHeight) {
            adjustedTop = window.innerHeight - popupHeight + 20;
          }
          if (adjustedTop < 0) {
            adjustedTop = 10;
          }

          moreActionsPopupPosition.value = {
            left: adjustedLeft,
            top: adjustedTop,
          };
        }
      } catch (error) {
        console.error("更新悬浮窗位置失败:", error);
        // 出错时关闭悬浮窗
        closeMoreActionsPopup();
      }
    }
  };

  // 关闭更多操作悬浮窗
  const closeMoreActionsPopup = () => {
    showMoreActionsPopup.value = false;
    selectedNode.value = null;
    currentRowIndex.value = -1;
    currentColIndex.value = -1;
  };

  // 处理更多操作菜单中的操作
  const handleMoreAction = (actionKey: string) => {
    if (!selectedNode.value) return;
    console.log("selectedNode.value", selectedNode.value, actionKey);
    emit("handleMoreAction", selectedNode.value, actionKey);
  };

  // 添加子节点的方法
  const addChildNode = (parentNode: LifeCycleEntity) => {
    if (props.onAddNode) {
      // 创建一个新的子节点
      const newNode: LifeCycleEntity = {
        id: Date.now().toString(),
        no: Date.now().toString(),
        name: "新节点",
        type: "task",
        priority: [],
        status: "待开始",
        startDate: "",
        endDate: "",
        assignee: "",
        date: "",
        children: [],
      };

      props.onAddNode(parentNode, newNode);

      // 重新设置表格数据
      if (tableInstance) {
        tableInstance.setRecords(originalData.value);
      }
    }
  };

  // 处理设置图标点击事件 (已存在的方法，保持不变)

  const initData = () => {
    if (props.initialData && props.initialData.length > 0) {
      originalData.value = JSON.parse(JSON.stringify(props.initialData));
    }
  };

  initData();

  // 监听初始数据变化
  watch(
    () => props.initialData,
    () => {
      initData();
      if (tableInstance) {
        tableInstance.setRecords(originalData.value);
      }
    },
    { deep: true },
  );

  // 应用行高设置
  const applyLineHeight = () => {
    if (props.lineHeight && tableInstance) {
      // 根据行高设置计算实际像素值
      let height = 36; // 默认高度
      switch (props.lineHeight) {
        case "low":
          height = 36;
          break;
        case "medium":
          height = 60;
          break;
        case "high":
          height = 90;
          break;
        case "ultra-high":
          height = 130;
          break;
      }
      const rows = props.fields || [];
      rows.forEach((_, rowIndex) => {
        if (rowIndex > 0) {
          tableInstance.setRowHeight(rowIndex, height);
        }
      });
    }
  };

  // 监听行高变化
  watch(
    () => props.lineHeight,
    () => {
      console.log("============");
      // 只有当表格实例存在时才应用行高设置
      if (tableInstance) {
        applyLineHeight();
      }
    },
    { immediate: true }, // 移除immediate: true，避免在组件初始化时过早调用
  );

  // 在onMounted中确保行高设置正确应用

  // 定义节点数据类型接口
  interface TreeNodeData {
    level?: number;
    priority: string[];
    status: string;
    [key: string]: any;
  }

  const inputEditor = new VTableEditors.InputEditor();
  VTable.register.editor("input-editor", inputEditor);

  const customDateEditor = new ElementPlusDateEditor({
    valueFormat: "YYYY-MM-DD",
    type: "date",
  });
  VTable.register.editor("custom-element-plus-date", customDateEditor);

  const statusSelectEditor = new CLSelectEditor({
    options: statusOptions,
    placeholder: "请选择",
    multiple: false,
  });
  VTable.register.editor("custom-single-select", statusSelectEditor);

  const prioritySelectEditor = new CLSelectEditor({
    options: priorityOptions,
    placeholder: "请选择",
    multiple: true,
  });
  VTable.register.editor("custom-priority-select", prioritySelectEditor);

  VTable.register.icon("add", {
    type: "svg",
    svg: plusIcon,
    width: 16,
    height: 16,
    name: "addIcon",
    positionType: VTable.TYPES.IconPosition.right,
    visibleTime: "mouseenter_cell",
    marginRight: 10,
    hover: {
      width: 16,
      height: 16,
      bgColor: "",
    },
    cursor: "pointer",
    tooltip: {
      style: { arrowMark: true },
      title: "添加子记录",
      placement: VTable.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });
  VTable.register.icon("view", {
    type: "svg",
    svg: viewIcon,
    width: 16,
    height: 16,
    name: "ViewIcon",
    positionType: VTable.TYPES.IconPosition.right,
    visibleTime: "mouseenter_cell",
    marginRight: 0,
    hover: {
      width: 16,
      height: 16,
      bgColor: "",
    },
    cursor: "pointer",
    tooltip: {
      style: { arrowMark: true },
      title: "查看详情",
      placement: VTable.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });

  // 基础列配置（NO列和需求名列）
  const baseColumns = computed<ColumnConfig[]>(() => [
    {
      field: props.fields[0].field,
      title: props.fields[0].name,
      width: 160,
      style: {
        paddingLeft: (datum: TreeNodeData) => {
          const level = datum.level || 0;
          return `${level * 20 + 10}px`;
        },
      },
    },
    {
      field: props.fields[1].field,
      title: props.fields[1].name,
      width: 220,
      icon: ["view"],
      style: {
        color: "#1890ff",
        cursor: "pointer",
      },
    },
  ]);

  // 定义操作列图标
  const EditIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H19C20.1046 20 21 19.1046 21 18V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V18C3 19.1046 3.89543 20 5 20H12ZM15 4L19.5528 8.55279L14 14.1056L9.44721 9.55279L15 4Z" stroke="#409EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const DeleteIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="#F56C6C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  VTable.register.icon("more", {
    type: "svg",
    svg: moreIcon,
    width: 20,
    height: 20,
    name: "moreIcon",
    positionType: VTable.TYPES.IconPosition.right,
    visibleTime: "always",
    marginRight: 10,
    hover: {
      width: 20,
      height: 20,
      bgColor: "#f5f5f5",
    },
    cursor: "pointer",
    tooltip: {
      style: { arrowMark: true },
      title: "更多操作",
      placement: VTable.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });

  VTable.register.icon("edit", {
    type: "svg",
    svg: EditIcon,
    width: 18,
    height: 18,
    name: "editIcon",
    positionType: VTable.TYPES.IconPosition.right,
    visibleTime: "mouseenter_cell",
    marginRight: 8,
    hover: {
      width: 18,
      height: 18,
      bgColor: "#e6f7ff",
    },
    cursor: "pointer",
    tooltip: {
      style: { arrowMark: true },
      title: "编辑",
      placement: VTable.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });

  VTable.register.icon("delete", {
    type: "svg",
    svg: DeleteIcon,
    width: 18,
    height: 18,
    name: "deleteIcon",
    positionType: VTable.TYPES.IconPosition.right,
    visibleTime: "mouseenter_cell",
    marginRight: 0,
    hover: {
      width: 18,
      height: 18,
      bgColor: "#fff1f0",
    },
    cursor: "pointer",
    tooltip: {
      style: { arrowMark: true },
      title: "删除",
      placement: VTable.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });

  // 定义通用的列配置接口
  interface ColumnConfig {
    field: string;
    title: string;
    width: number;
    editor?: string;
    fieldFormat?: (rec: LifeCycleEntity) => string;
    style: any;
    tree?: boolean;
    icon?: string[];
    headerIcon?: any[];
    customLayout?: any;
    cellType?: string;
    disable?: boolean;
  }

  // 根据字段名称获取列配置
  const getColumnConfigByName = (field: DynamicField): ColumnConfig | null => {
    const tableField = field.field;
    if (!tableField) return null;

    switch (tableField) {
      case "name":
        return {
          field: tableField,
          title: field.name,
          width: 240,
          editor: "input-editor",
          fieldFormat(rec: LifeCycleEntity) {
            return rec.name;
          },
          style: {
            paddingLeft: (datum: TreeNodeData) => {
              const level = datum.level || 0;
              return `${level * 20 + 10}px`;
            },
            fontWeight: (datum: TreeNodeData) => {
              // 项目类型加粗显示
              return datum.type === "project" ? "bold" : "normal";
            },
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
      case "priority":
        return {
          field: tableField,
          title: field.name,
          width: 190,
          editor: "custom-priority-select",
          fieldFormat(rec: LifeCycleEntity) {
            return rec.priority.join(", ");
          },
          style: {
            // bgColor: (datum: TreeNodeData) => {
            //   return priorityColors[datum.priority] || "#d9d9d9";
            // },
            justifyContent: "center",
            borderRadius: "4px",
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row);
            const container = new VTable.CustomLayout.Group({
              width,
              height,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignContent: "center",
            });

            const containerContent = new VTable.CustomLayout.Group({
              opacity: 0.1,
              width: width,
              height: height,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "center",
            });

            record.priority.length &&
              record.priority.map((str: string) => {
                const tag = new VTable.CustomLayout.Tag({
                  text: str,
                  textStyle: {
                    fontSize: 12,
                    fontFamily: "sans-serif",
                    fill: "#fff",
                  },
                  panel: {
                    visible: true,
                    fill: priorityColors[str],
                    lineWidth: 1,
                    cornerRadius: 8,
                  },
                  boundsPadding: [0, 0, 0, 10],
                  padding: [3, 6],
                });
                (containerContent as any).add(tag);
              });

            (container as any).add(containerContent);

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
        };
      case "status":
        return {
          field: tableField,
          title: field.name,
          width: 100,
          editor: "custom-single-select",
          fieldFormat(rec: LifeCycleEntity) {
            return rec.status;
          },
          style: {
            justifyContent: "center",
            borderRadius: "4px",
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row);
            const containerContent = new VTable.CustomLayout.Group({
              opacity: 0.1,
              width: width,
              height: height,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "center",
            });
            const tag = new VTable.CustomLayout.Tag({
              text: record.status,
              textStyle: {
                fontSize: 12,
                fontFamily: "sans-serif",
                fill: "#fff",
              },
              panel: {
                visible: true,
                fill: statusColors[record.status],
                lineWidth: 1,
                cornerRadius: 10,
              },
              boundsPadding: [0, 0, 0, 10],
              padding: [4, 10, 4, 10],
            });
            (containerContent as any).add(tag);

            return {
              rootContainer: containerContent,
              renderDefault: false,
            };
          },
        };
      case "startDate":
      case "endDate":
        return {
          field: tableField,
          title: field.name,
          width: 140,
          editor: "custom-element-plus-date",
          fieldFormat(rec: LifeCycleEntity) {
            return rec[tableField] || "";
          },
          style: {},
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
      case "assignee":
        return {
          field: tableField,
          title: field.name,
          width: 180,
          style: { justifyContent: "flex-start" },
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const record = table.getRecordByRowCol(col, row) || {};
            const name = String(record.assignee || "");
            const shortName = shortNameOf(name); // 你之前的 shortNameOf
            const bg = stringToColor(name || "unknown");
            const fg = pickReadableColor(bg);

            const cellRect = rect ||
              table.getCellRect(col, row) || { width: 180, height: 32 };
            const avatarSize = 25;
            const gap = 4; // 头像与名字间距

            // 根容器：横向排列，垂直居中
            const container = new VTable.CustomLayout.Group({
              width: cellRect.width,
              height: cellRect.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            });

            // avatarGroup：用于把圆背景和文本叠在一起
            const avatarGroup = new VTable.CustomLayout.Group({
              width: avatarSize,
              height: avatarSize,
            });

            // 圆形背景（用 Rect + cornerRadius = width/2）
            const avatarBg = new VTable.CustomLayout.Rect({
              width: avatarSize,
              height: avatarSize,
              fill: bg,
              cornerRadius: avatarSize / 2,
              boundsPadding: [0, gap, 0, gap],
            });

            // 圆中文字：用 x/y 放到圆心，textAlign/textBaseline 做居中
            const avatarText = new VTable.CustomLayout.Text({
              text: shortName,
              fontSize: Math.floor(avatarSize * 0.4),
              fontWeight: "500",
              fill: fg,
              textAlign: "center",
              textBaseline: "middle",
              x: avatarSize / 2,
              y: avatarSize / 2,
            });

            (avatarGroup as any).add(avatarBg);
            (avatarGroup as any).add(avatarText);

            // 名字文本
            const nameText = new VTable.CustomLayout.Text({
              text: name,
              fontSize: 13,
              fill: "#333",
              textBaseline: "middle",
              y: cellRect.height / 2,
              maxLineWidth: cellRect.width - avatarSize - 20, // 设置最大宽度，留出头像和间距的空间
              ellipsis: "...", // 超长显示省略号
            });

            (container as any).add(avatarGroup);
            (container as any).add(nameText);

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
      case "checkbox":
        return {
          field: tableField,
          title: field.name,
          width: 100,
          cellType: tableField,
          // fieldFormat(rec: LifeCycleEntity) {
          //   return rec.checkbox?.name || "";
          // },
          style: {
            paddingLeft: (datum: TreeNodeData) => {
              const level = datum.level || 0;
              return `${level * 20 + 10}px`;
            },
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
      case "progress":
        return {
          field: tableField,
          title: field.name,
          width: 120,
          fieldFormat(rec: LifeCycleEntity) {
            return `${rec.progress || 0}%`;
          },
          style: {
            justifyContent: "center",
          },
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row) || {};
            const progressValue = record.progress || 0;
            const barHeight = 12;
            const barTop = (height - barHeight) / 2;
            const valueWidth = Math.round((width - 20) * (progressValue / 100));

            // 根容器
            const container = new VTable.CustomLayout.Group({
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            });

            // 背景条
            const bgBar = new VTable.CustomLayout.Rect({
              width: width - 20,
              height: barHeight,
              fill: "#e9e9e9",
              cornerRadius: barHeight / 2,
            });

            // 进度条
            const progressBar = new VTable.CustomLayout.Rect({
              width: valueWidth,
              height: barHeight,
              fill: progressValue === 100 ? "#52c41a" : "#1890ff",
              cornerRadius: barHeight / 2,
            });

            // 百分比文本
            const progressText = new VTable.CustomLayout.Text({
              text: `${progressValue}%`,
              fontSize: 12,
              fill: "#333",
              textAlign: "center",
              textBaseline: "middle",
              x: width / 2,
              y: height / 2,
            });

            (container as any).add(bgBar);
            (container as any).add(progressBar);
            (container as any).add(progressText);

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
      case "type":
        return {
          field: tableField,
          title: field.name,
          width: 100,
          fieldFormat(rec: LifeCycleEntity) {
            return rec.type || "";
          },
          style: {
            justifyContent: "center",
          },
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row) || {};
            const typeValue = record.type || "";

            // 根容器
            const container = new VTable.CustomLayout.Group({
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            });

            // 类型标签
            const typeTag = new VTable.CustomLayout.Tag({
              text: typeValue === "project" ? "项目" : "任务",
              textStyle: {
                fontSize: 12,
                fontFamily: "sans-serif",
                fill: "#fff",
              },
              panel: {
                visible: true,
                fill: typeValue === "project" ? "#1890ff" : "#52c41a",
                lineWidth: 1,
                cornerRadius: 10,
              },
              boundsPadding: [0, 0, 0, 10],
              padding: [4, 10, 4, 10],
            });

            (container as any).add(typeTag);

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
      case "operations":
        return {
          field: tableField,
          title: "",
          width: 34,
          style: {
            justifyContent: "center",
            padding: "0",
          },
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);

            // 根容器
            const container = new VTable.CustomLayout.Group({
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            });

            // 更多操作图标
            const more = new VTable.CustomLayout.Icon({
              svg: moreIcon,
              width: 14,
              height: 10,
              cursor: "pointer",
            });
            (container as any).add(more);
            more.addEventListener("click", (e: any) => {
              // 获取点击位置
              const rect = table.getCellRect(col, row);
              const tableRect = tableContainer.value?.getBoundingClientRect();
              const bounds = rect?.bounds;
              if (rect && tableRect && bounds) {
                const leftPos =
                  (tableRect.left || 0) +
                  (bounds.x1 || 0) +
                  (rect.width || 0) -
                  20 +
                  (window.scrollX || 0);
                const topPos =
                  (tableRect.top || 0) +
                  (bounds.y1 || 0) +
                  (rect.height || 0) / 2 +
                  (window.scrollY || 0);

                const popupWidth = 160;
                const popupHeight = 200;

                let adjustedLeft = leftPos - 140;
                let adjustedTop = topPos - 20;

                if (adjustedLeft + popupWidth > window.innerWidth) {
                  adjustedLeft = window.innerWidth - popupWidth - 10;
                }
                if (adjustedLeft < 0) {
                  adjustedLeft = 10;
                }
                if (adjustedTop + popupHeight > window.innerHeight) {
                  adjustedTop = window.innerHeight - popupHeight + 20;
                }
                if (adjustedTop < 0) {
                  adjustedTop = 10;
                }

                const popupPosition = {
                  left: adjustedLeft,
                  top: adjustedTop,
                };

                // 存储当前选中的节点
                selectedNode.value = table.getRecordByRowCol(
                  col,
                  row,
                ) as LifeCycleEntity;
                currentRowIndex.value = row;
                currentColIndex.value = col;

                // 显示悬浮窗
                setTimeout(() => {
                  showMoreActionsPopup.value = true;
                  moreActionsPopupPosition.value = popupPosition;
                }, 100);
              }

              console.log("更多操作", e);
              e.stopPropagation();
            });

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
          headerIcon: [
            {
              type: "svg",
              name: "settingIcon",
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 16,
              height: 16,
              marginLeft: -2,
              svg: settingIcon,
              cursor: "pointer",
            },
          ],
        };
      default:
        return {
          field: tableField,
          title: field.name,
          width: 120,
          editor: "input-editor",
          fieldFormat(rec: LifeCycleEntity) {
            return (rec as any)[tableField] || "";
          },
          style: {},
          headerIcon: [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ],
        };
    }
  };
  // 头像的颜色、名字的颜色、背景色
  function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  }
  function pickReadableColor(hex: string): string {
    const m = (hex || "#000000").replace("#", "");
    const r = parseInt(m.substring(0, 2), 16);
    const g = parseInt(m.substring(2, 4), 16);
    const b = parseInt(m.substring(4, 6), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.6 ? "#000" : "#fff";
  }
  function shortNameOf(name: string): string {
    if (!name) return "";
    // 如果是中文（含汉字）
    if (/[\u4e00-\u9fa5]/.test(name)) {
      return name.slice(-2); // 最后两个字
    }
    // 如果是英文
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      // 多个英文单词 → 取前两个单词首字母
      return (
        parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
      );
    }
  }
  // 动态生成表格列配置
  const dynamicColumns = computed<ColumnConfig[]>(() => {
    if (!props.fields || props.fields.length === 0) {
      // 如果没有传入fields，返回默认列
      return [];
    }

    // 从baseColumns开始构建列配置
    const columnsConfig: ColumnConfig[] = [...baseColumns.value];

    props.fields.forEach((field) => {
      // 跳过ID和需求名列，这些已经在baseColumns中
      if (field.name === "id") return;

      // 如果字段不可见，跳过
      if (!field.invisible) return;

      const columnConfig = getColumnConfigByName(field);
      if (columnConfig) {
        columnsConfig.push(columnConfig);
      }
    });

    // 添加操作列
    const operationsField = {
      id: 999,
      name: "操作",
      field: "operations",
      type: "string",
      invisible: true,
    } as DynamicField;

    const operationsColumn = getColumnConfigByName(operationsField);
    if (operationsColumn) {
      columnsConfig.push(operationsColumn);
    }

    return columnsConfig;
  });

  const wbsTheme = VTable.themes.ARCO.extends({
    defaultStyle: {
      borderLineWidth: 0,
    },
    headerStyle: {
      bgColor: "#FFF",
      borderColor: "#f1e8fe",
      borderLineWidth: 1,
      fontWeight: "normal",
      color: "#1f2329",
      fontSize: 14,
      hover: {
        cellBgColor: "#F7F8FA",
      },
    },
    bodyStyle: {
      borderColor: "#f1e8fe",
      bgColor: "#FFF",
      borderLineWidth: 1,
      color: "#1f2329",
      fontSize: 13,
      hover: {
        cellBgColor: "#F7F8FA",
        inlineRowBgColor: "#F7F8FA",
        inlineColumnBgColor: "#F7F8FA",
      },
      select: {
        inlineRowBgColor: "#F7F8FA",
      },
    },
    selectionStyle: {
      cellBgColor: "rgba(255, 255, 255,0.1)",
      cellBorderLineWidth: 2,
      cellBorderColor: "#3073f2",
    },
    frameStyle: {
      borderColor: "#f1e8fe",
      borderLineWidth: 1,
      borderLineDash: [],
      cornerRadius: 0,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#FFF",
    },
    cellInnerBorder: false,
  });

  // 定义表格选项
  const tableOption = computed(() => ({
    rowResizeType: "row",
    rowResizeMode: "all",
    dragOrder: {
      dragHeaderMode: "column",
    },
    frozenColCount: 3,
    rightFrozenColCount: 1,
    overscrollBehavior: "none",
    hover: {
      highlightMode: "row",
    },
    heightMode: "standard",
    tooltip: {
      isShowOverflowTextTooltip: true,
    },
    autoFillWidth: true,
    autoFillHeight: false,
    menu: {
      contextMenuItems: ["添加项目", "删除"],
    },
    defaultHeaderRowHeight: 36,
    defaultRowHeight: 36,
    records: originalData.value,
    columns: dynamicColumns.value,
    widthMode: "standard",
    theme: wbsTheme,
    editCellTrigger: "doubleclick",
    enableLineBreak: true,
    // 配置树形结构的关键参数
    tree: {
      childrenKey: "children",
    },
    rowSeriesNumber: {
      width: "auto",
      format: (col?: number, row?: number, table?: any) => {
        if (
          table &&
          typeof (table as any).getRecord === "function" &&
          row !== undefined
        ) {
          const record = (table as any).getRecord(row);
          return record ? record.id : "";
        }
        return "";
      },
      cellType: "checkbox",
      enableTreeCheckbox: true,
      dragOrder: false,
    },
    scrollStyle: {
      scrollRailColor: "rgba(246,246,246,0.5)",
      visible: "scrolling",
      width: 4,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: "#5cb85c",
    },
  })) as any; // 使用类型断言解决类型兼容性问题

  // 存储选中的节点ID集合
  const selectedNodeIds = ref<Set<string>>(new Set());

  // 递归选中所有子节点
  const selectChildNodes = (node: LifeCycleEntity): void => {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        selectedNodeIds.value.add(child.id);
        selectChildNodes(child);
      });
    }
  };

  // 递归取消选中所有子节点
  const unselectChildNodes = (node: LifeCycleEntity): void => {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        selectedNodeIds.value.delete(child.id);
        unselectChildNodes(child);
      });
    }
  };

  // 获取选中的节点
  // 获取所有选中的节点
  const getSelectedNodes = (): LifeCycleEntity[] => {
    const selectedNodes: LifeCycleEntity[] = [];

    if (
      !tableInstance ||
      !originalData.value ||
      originalData.value.length === 0
    ) {
      return selectedNodes;
    }

    // 递归遍历所有节点，检查每个节点的复选框状态
    const findSelectedNodes = (
      nodes: LifeCycleEntity[],
      parentPath: string[] = [],
    ) => {
      nodes.forEach((node, nodeIndex) => {
        // 构建完整路径（包括父节点索引）
        const currentPath = [...parentPath, nodeIndex.toString()];

        // 获取当前节点的复选框状态
        // 对于树形结构，需要使用正确的索引路径
        let isChecked = false;
        try {
          // 尝试直接通过索引获取状态
          const state = tableInstance?.getCellCheckboxState(0, nodeIndex + 1);
          // 检查状态是否为true或带有checked属性为true的对象
          isChecked =
            state === true ||
            (typeof state === "object" && (state as any)?.checked);
        } catch (error) {
          console.error("获取复选框状态失败:", error);
        }

        // 如果节点被选中
        if (isChecked) {
          selectedNodes.push(node);
        }

        // 递归检查子节点
        if (node.children && node.children.length > 0) {
          findSelectedNodes(node.children, currentPath);
        }
      });
    };

    // 开始遍历根节点
    findSelectedNodes(originalData.value);

    return selectedNodes;
  };

  // 初始化表格
  const initTable = () => {
    if (!tableContainer.value) return;

    // 销毁已存在的表格实例
    if (tableInstance) {
      // tableInstance.destroy();
      tableInstance = null;
    }

    // 创建树表实例
    tableInstance = new VTable.ListTable(
      tableContainer.value,
      tableOption.value,
    );

    tableInstance.on("change_cell_value", (args: any) => {
      // 编辑单元格数据
      console.log("change_cell_value", args);
      // const { row, col, newValue, originData } = args;
      // const field = tableOption.value.columns[col].field;
      // const node = originData as LifeCycleEntity;
      //
      // // 更新本地数据
      // if (field === "priority") {
      //   // 优先级是数组类型
      //   (node as any)[field] = Array.isArray(newValue) ? newValue : [newValue];
      // } else {
      //   (node as any)[field] = newValue;
      // }
      //
      // // 通知父组件数据更新
      // if (props.onUpdateNode) {
      //   props.onUpdateNode(node, field, newValue);
      // }
      //
      // // 触发update事件，让父组件可以同步更新数据
      // emit("update:initialData", originalData.value);
    });
    // 添加单元格点击事件处理操作功能
    tableInstance.on("click_cell", (args: any) => {
      const { targetIcon, col, row } = args;

      // 如果点击的不是moreIcon，则关闭悬浮窗
      if (targetIcon && targetIcon.name !== "moreIcon") {
        closeMoreActionsPopup();
      }
      const cellInfo = tableInstance.getCellInfo(col, row);
      if (targetIcon) {
        if (targetIcon.name === "addIcon") {
          const record = cellInfo.originData;
          if (record) {
            addChildNode(record as LifeCycleEntity);
            const status = tableInstance.getHierarchyState(col, row);
            if (status === "collapse") {
              tableInstance.toggleHierarchyState(col, row);
            }
          }
        } else if (targetIcon.name === "ViewIcon") {
          // tableInstance.startEditCell(col, row);
        } else if (targetIcon.name === "deleteIcon") {
          // 删除操作
        } else if (targetIcon.name === "settingIcon") {
          const tableRect = tableContainer.value?.getBoundingClientRect();
          const iconPosition = {
            left: (tableRect?.right || 0) - 50,
            top: (tableRect?.top || 0) - 40,
          };

          const popupPosition = {
            left: iconPosition.left - 230,
            top: iconPosition.top,
          };

          if (showFieldConfigPopup) {
            showFieldConfigPopup(popupPosition);
          }
        }
      } else if (args.field === "_vtable_rowSeries_number") {
        const cellInfo = tableInstance?.getCellInfo(col, row);
        if (!cellInfo) return;
        // 获取所有选中的节点并触发事件
        const selectedNodes = getSelectedNodes();
        if (cellInfo.originData) {
          emit("show:parentRecord", cellInfo.originData);
        }
        emit("show:records", selectedNodes);
      } else if (args.col === 2) {
        // 点击了操作列
      } else {
        // 点击了其他区域，关闭悬浮窗
        closeMoreActionsPopup();
        if (col === 1) {
          return;
        }
      }
    });

    // 移除阻止双击事件的代码，让VTable默认的双击编辑行为正常工作
    // tableInstance.on("dblclick_cell", (args: any) => {
    //   console.log("单元格被双击", args);
    //   args.event.stopPropagation();
    //   args.event.preventDefault();
    // });
    tableInstance.on("dropdown_menu_click", (args: any) => {
      const { col, row } = args;
      const cellInfo = tableInstance.getCellInfo(col, row);

      if (args.menuKey === "添加子记录") {
        addChildNode(cellInfo.originData);
        const status = tableInstance.getHierarchyState(col, row);
        if (status === "collapse") {
          tableInstance.toggleHierarchyState(col, row);
        }
      } else if (args.menuKey === "删除") {
        //获取当前行数据
        const record = tableInstance.getCellInfo(args.col, args.row);
        const node = record.originData;

        const tmpFlag = false;
        // 如果父组件提供了删除节点的钩子函数，调用它
        if (props.onDeleteNode && tmpFlag) {
          props.onDeleteNode(node);
        } else {
          // 否则使用默认的删除逻辑
          const no = node.no;
          const rs = removeChildNode(tableOption.value.records, no);
          if (rs) {
            tableInstance.setRecords(tableOption.value.records);
          }
        }

        // 触发update事件，让父组件可以同步更新数据
        emit("update:initialData", originalData.value);
      }
    });

    // 鼠标悬浮单元格
    tableInstance.on("mouseenter_cell", (_args: any) => {});

    // 鼠标离开单元格时的处理
    tableInstance.on("mouseleave_cell", () => {});
    tableInstance.on("mouseenter_row", (_args: any) => {});
    tableInstance.on("mouseenter_row", (_args: any) => {
      console.log("========mouseenter_row========", _args);
    });

    applyLineHeight();
  };

  const updateNodeIds = (node: LifeCycleEntity, newPrefix: string): void => {
    node.id = newPrefix;
    node.no = newPrefix;
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        const childPrefix = `${newPrefix}-${index + 1}`;
        updateNodeIds(child, childPrefix);
      });
    }
  };

  const removeChildNode = (list: LifeCycleEntity[], no: string): boolean => {
    if (!list || !Array.isArray(list) || !no) return false;

    for (let i = 0; i < list.length; i++) {
      const node = list[i];

      if (node.no === no) {
        list.splice(i, 1);

        const parentNoParts = no.split("-");
        // 如果不是顶级节点
        if (parentNoParts.length > 1) {
          const parentNo = parentNoParts.slice(0, -1).join("-");
          // 遍历剩余的同级节点，重新编号
          for (let j = i; j < list.length; j++) {
            const newNo = `${parentNo}-${j + 1}`; // j 是删除后数组的索引（从0开始），但节点编号从1开始
            updateNodeIds(list[j], newNo);
          }
        } else {
          // 顶级节点的情况
          for (let j = i; j < list.length; j++) {
            const oldNodeNo = list[j].no;
            const oldNodeNoParts = oldNodeNo.split("-");
            if (oldNodeNoParts.length === 1) {
              // 直接更新顶级节点
              const newNo = `${j + 1}`;
              updateNodeIds(list[j], newNo);
            }
          }
        }

        return true;
      }

      if (node.children && node.children.length > 0) {
        const found = removeChildNode(node.children, no);

        if (found) {
          // 当子节点列表为空时，删除children属性
          if (node.children.length === 0) {
            delete node.children;
          }
          return true;
        }
      }
    }

    return false;
  };

  defineExpose({
    addChildNode,
  });

  // 处理搜索
  const handleSearch = () => {
    if (!tableInstance) return;

    const keyword = searchKeyword.value.toLowerCase().trim();
    if (!keyword) {
      tableInstance.setRecords(originalData.value);
      return;
    }

    // 递归搜索函数
    const searchInTree = (
      records: LifeCycleEntity[],
      keyword: string,
    ): LifeCycleEntity[] => {
      return records.reduce((acc: LifeCycleEntity[], record) => {
        const match =
          record.name.toLowerCase().includes(keyword) ||
          record.assignee.toLowerCase().includes(keyword) ||
          // record.priority.toLowerCase().includes(keyword) ||
          record.status.toLowerCase().includes(keyword);

        if (record.children && record.children.length > 0) {
          const filteredChildren = searchInTree(record.children, keyword);
          if (match || filteredChildren.length > 0) {
            const newRecord = { ...record };
            if (filteredChildren.length > 0) {
              newRecord.children = filteredChildren;
            }
            acc.push(newRecord);
          }
        } else if (match) {
          acc.push({ ...record });
        }

        return acc;
      }, []);
    };

    const filteredData = searchInTree(originalData.value, keyword);
    tableInstance.setRecords(filteredData);
  };

  // 监听搜索关键词变化
  watch(searchKeyword, handleSearch);

  // 计算项目统计数据
  const totalTasks = computed(() => {
    const countTasks = (tasks: LifeCycleEntity[]) => {
      let count = tasks.length;
      tasks.forEach((task) => {
        if (task.children && task.children.length > 0) {
          count += countTasks(task.children);
        }
      });
      return count;
    };
    return countTasks(originalData.value);
  });

  const completedTasks = computed(() => {
    const countCompleted = (tasks: LifeCycleEntity[]) => {
      let count = tasks.filter((task) => task.status === "已完成").length;
      tasks.forEach((task) => {
        if (task.children && task.children.length > 0) {
          count += countCompleted(task.children);
        }
      });
      return count;
    };
    return countCompleted(originalData.value);
  });

  const inProgressTasks = computed(() => {
    const countInProgress = (tasks: LifeCycleEntity[]) => {
      let count = tasks.filter((task) => task.status === "进行中").length;
      tasks.forEach((task) => {
        if (task.children && task.children.length > 0) {
          count += countInProgress(task.children);
        }
      });
      return count;
    };
    return countInProgress(originalData.value);
  });

  const pendingTasks = computed(() => {
    const countPending = (tasks: LifeCycleEntity[]) => {
      let count = tasks.filter((task) => task.status === "未开始").length;
      tasks.forEach((task) => {
        if (task.children && task.children.length > 0) {
          count += countPending(task.children);
        }
      });
      return count;
    };
    return countPending(originalData.value);
  });

  const completedPercentage = computed(() => {
    return totalTasks.value > 0
      ? Math.round((completedTasks.value / totalTasks.value) * 100)
      : 0;
  });

  const inProgressPercentage = computed(() => {
    return totalTasks.value > 0
      ? Math.round((inProgressTasks.value / totalTasks.value) * 100)
      : 0;
  });

  const pendingPercentage = computed(() => {
    return totalTasks.value > 0
      ? Math.round((pendingTasks.value / totalTasks.value) * 100)
      : 0;
  });

  // const countByPriority = computed(() => {
  //   const counts: Record<string, number> = {};
  //   const countPriorities = (tasks: LifeCycleEntity[]) => {
  //     tasks.forEach((task) => {
  //       if (task.priority) {
  //         counts[task.priority] = (counts[task.priority] || 0) + 1;
  //       }
  //       if (task.children && task.children.length > 0) {
  //         countPriorities(task.children);
  //       }
  //     });
  //   };
  //   countPriorities(originalData.value);
  //   return counts;
  // });

  const tasksByassignee = computed(() => {
    const assigneeTasks: Record<string, LifeCycleEntity[]> = {};
    const groupByassignee = (tasks: LifeCycleEntity[]) => {
      tasks.forEach((task) => {
        if (task.assignee) {
          if (!assigneeTasks[task.assignee]) {
            assigneeTasks[task.assignee] = [];
          }
          assigneeTasks[task.assignee].push(task);
        }
        if (task.children && task.children.length > 0) {
          groupByassignee(task.children);
        }
      });
    };
    groupByassignee(originalData.value);
    return assigneeTasks;
  });

  // 组件挂载时初始化表格
  onMounted(() => {
    // 立即初始化表格（因为默认显示需求列表选项卡）
    initTable();
    applyLineHeight();

    // 添加窗口滚动和调整大小事件监听器
    window.addEventListener("scroll", updatePopupPositionOnScrollOrResize);
    window.addEventListener("resize", updatePopupPositionOnScrollOrResize);

    // 监听Tab切换，确保在切换回需求列表时表格仍能正确显示
    if (props.activeTab !== undefined) {
      watch(
        () => props.activeTab,
        (newTab) => {
          if (newTab === 2 && tableContainer.value) {
            initTable();
            // 切换Tab后重新应用行高设置
            applyLineHeight();
          }
        },
      );
    }

    // 监听fields变化，动态更新表格列
    watch(
      () => props.fields,
      () => {
        if (tableContainer.value) {
          initTable();
          // 列更新后重新应用行高设置
          applyLineHeight();
        }
      },
      { deep: true },
    );
  });

  // 组件卸载时销毁表格
  onUnmounted(() => {
    if (tableInstance) {
      // tableInstance.destroy();
      tableInstance = null;
    }

    // 移除窗口滚动和调整大小事件监听器
    window.removeEventListener("scroll", updatePopupPositionOnScrollOrResize);
    window.removeEventListener("resize", updatePopupPositionOnScrollOrResize);
  });
</script>

<style lang="scss" scoped>
  $primary-color: #1890ff;
  $success-color: #52c41a;
  $warning-color: #fa8c16;
  $danger-color: #ff4d4f;
  $text-color: #666666;
  $light-text: rgba(0, 0, 0, 0.5);
  $border-color: #e0e0e0;
  $background-color: #f8f9fa;
  $hover-bg: #e6f7ff;

  .tree-table-container {
    .table-container {
      width: 100%;
      height: calc(100vh - 90px);
      overflow: hidden;
      background-color: #ffffff;
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

    .assignee-card {
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

    .assignee-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .assignee-avatar {
      font-size: 24px;
      margin-right: 8px;
    }

    .assignee-name {
      font-size: 16px;
      font-weight: 600;
      color: $text-color;
    }

    .assignee-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .assignee-task-count {
      font-size: 14px;
      color: $text-color;
    }

    .task-count {
      font-weight: 600;
      color: $primary-color;
    }

    .assignee-task-breakdown {
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

  // 自定义VTable样式
  :deep(.v-table-header) {
    background-color: $background-color !important;
    border-bottom: 2px solid $primary-color !important;
  }

  :deep(.v-table-cell) {
    border-color: $border-color !important;
    transition: background-color 0.2s;
    position: relative !important;

    &:hover {
      background-color: #f5f5f5 !important;
    }
  }

  :deep(.v-table-row) {
    &:hover {
      background-color: #f5f5f5 !important;
    }
  }

  :deep(.v-table-row-selected) {
    background-color: $hover-bg !important;
  }

  :deep(.v-table-checkbox) {
    cursor: pointer;
  }

  .other-content {
    padding: 20px;
    text-align: center;
    color: $light-text;
  }

  // 操作按钮悬停显示效果
  :deep(.cell-hover-effect) {
    position: relative !important;
    z-index: 10;
  }

  // 添加渐入和缩放动画效果
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: translateY(-50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }

  // 添加子节点图标的样式
  .add-child-icon {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    background-color: white !important;
    border-radius: 50% !important;
    border: 1px solid #ff4d4f !important;
    color: #ff4d4f !important;
    font-size: 14px !important;
    width: 24px !important;
    height: 24px !important;
    cursor: pointer !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    z-index: 1000 !important;
    padding: 0 !important;
    margin: 0 !important;
    transition: all 0.3s ease !important;
    animation: fadeInScale 0.3s ease forwards !important;

    &:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
  }
</style>
<style lang="scss">
  // /* 全局样式用于自定义日期选择器 */
  // .vtable-date-picker .el-input__inner {
  //   border: none;
  //   height: 100%;
  // }

  // .vtable-date-picker .el-input__wrapper {
  //   box-shadow: none;
  //   padding: 0 10px;
  // }
</style>
