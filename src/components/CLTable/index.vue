<template>
  <div class="tree-table-container">
    <div
      ref="tableContainer"
      class="table-container"
      :style="{ height: props?.tableConfig?.tableH }"
    >
      <!-- 连线删除悬浮窗 -->
      <div
        v-if="showLinkDeletePopup"
        class="link-delete-popup"
        :style="{
          left: linkDeletePopupPosition.left + 'px',
          top: linkDeletePopupPosition.top + 'px',
        }"
        @click.stop
      >
        <div class="popup-content">
          <div class="delete-action" @click="handleLinkDelete">删除连线</div>
        </div>
      </div>
    </div>
    <div class="pagination-container">
      <el-pagination
        v-if="tableConfig?.page?.enable"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="tableConfig?.page?.pageSizes"
        :size="tableConfig?.page?.size"
        :disabled="tableConfig?.page?.disabled"
        :background="tableConfig?.page?.background"
        :layout="
          tableConfig?.page?.layout || 'total, sizes, prev, pager, next, jumper'
        "
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <MoreActionsPopup
      v-if="hasAvailableActions"
      :visible="showMoreActionsPopup"
      :position="moreActionsPopupPosition"
      :actions="moreActions"
      @close="closeMoreActionsPopup"
      @action="handleMoreAction"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
  import * as VTable from "@visactor/vtable";
  import * as VTableGantt from "@visactor/vtable-gantt";
  import { registerCustomEditors } from "./register/index.ts";
  import { moreIcon, getIconForType, settingIcon } from "@/utils/SvgIcons";
  import { priorityColors, statusColors } from "./register/index";
  import MoreActionsPopup from "@/components/MoreActionsPopup.vue";

  import type {
    ColumnConfig,
    DynamicField,
    ProjectNode,
    TreeNodeData,
  } from "./interface.ts";

  // 定义props
  interface TableProps {
    fields: DynamicField[];
    activeTab?: number;
    // 从父组件传递的初始数据
    initialData?: ProjectNode[];
    initialLinks?: [];
    // 行高设置
    lineHeight?: "low" | "medium" | "high" | "ultra-high";
    tableConfig?: Record<string, any>;
    routerFields?: string[];

    // 时间维度显示配置
    timeScalesToShow?: Array<"year" | "month" | "week" | "day">;

    // 增删改钩子函数
    onAddNode?: (parentNode: ProjectNode, newNode: ProjectNode) => void;
    onDeleteNode?: (node: ProjectNode) => void;
    onUpdateNode?: (node: ProjectNode, field: string, value: any) => void;

    // 更多操作菜单配置
    moreActions?: Array<{ key: string; label: string }>;
    // 更多操作回调函数
    onMoreAction?: (actionKey: string, node: ProjectNode) => void;
  }

  // 接收props
  const props = defineProps<TableProps>();

  // 定义事件
  const emit = defineEmits<{
    "update:initialData": [data: ProjectNode[]];
    "update:saveField": [data: ProjectNode[]];
    "view-node-detail": [node: ProjectNode];
    "node-selected": [nodes: ProjectNode[]];
    "show:records": [nodes: ProjectNode[]];
    "edit-node": [node: ProjectNode];
    "delete-node": [node: ProjectNode];
    "add-child-node": [parentNode: ProjectNode];
    "show:parentRecord": [record: ProjectNode];
    "on-more-action": [actionKey: string, node: ProjectNode];
  }>();

  // 容器引用
  const tableContainer = ref<HTMLDivElement | null>(null);
  let tableInstance: any = null;
  let leftTableInstance: any = null;
  const searchKeyword = ref("");
  const originalData = ref<ProjectNode[]>([]);

  // 分页相关状态
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  // 从父组件注入显示字段配置弹窗的函数
  const showFieldConfigPopup = inject<
    (position: { left: number; top: number }) => void
  >("showFieldConfigPopup");

  // 定义moreIcon悬浮窗相关状态
  const showMoreActionsPopup = ref(false);
  const moreActionsPopupPosition = ref({ left: 0, top: 0 });
  const selectedNode = ref<ProjectNode | null>(null);
  const currentRowIndex = ref(-1);
  const currentColIndex = ref(-1);

  // 定义连线删除悬浮窗相关状态
  const showLinkDeletePopup = ref(false);
  const linkDeletePopupPosition = ref({ left: 0, top: 0 });
  const selectedLink = ref<any>(null);

  // 使用父组件提供的moreActions配置，如果没有提供则为空数组
  const moreActions = computed(() => props.moreActions || []);

  // 检查是否有可用的操作菜单
  const hasAvailableActions = computed(() => moreActions.value.length > 0);

  // 计算要显示的时间维度配置
  const computedScales = computed(() => {
    // 所有可用的时间维度配置
    const allScales = [
      {
        unit: "year",
        step: 1,
        format(date: any) {
          return `${date.dateIndex}年`;
        },
        style: {
          fontSize: 12,
          fontWeight: "400",
          color: "#111827",
          textAlign: "center",
          backgroundColor: "#FFF",
        },
      },
      {
        unit: "month",
        step: 1,
        format(date: any) {
          return VTableGantt.tools.formatDate(
            new Date(date.startDate),
            "yyyy年mm月",
          );
        },
        style: {
          fontSize: 12,
          fontWeight: "400",
          color: "#111827",
          textAlign: "center",
          backgroundColor: "#FFF",
        },
      },
      {
        unit: "week",
        step: 1,
        startOfWeek: "monday",
        format(date: any) {
          return `第 ${date.dateIndex} 周`;
        },
        style: {
          fontSize: 12,
          fontWeight: "400",
          color: "#111827",
          textAlign: "center",
          backgroundColor: "#FFF",
        },
      },
      {
        unit: "day",
        step: 1,
        format(date: any) {
          return VTableGantt.tools.formatDate(
            new Date(date.startDate),
            "mm月dd日",
          );
        },
        style: {
          fontSize: 12,
          fontWeight: "400",
          color: "#111827",
          textAlign: "center",
          backgroundColor: "#FFF",
        },
      },
    ];

    // 如果没有指定显示的时间维度，默认显示所有
    if (!props.timeScalesToShow || props.timeScalesToShow.length === 0) {
      return allScales;
    }

    // 根据指定的时间维度过滤显示
    return allScales.filter((scale) =>
      props.timeScalesToShow?.includes(scale.unit as any),
    );
  });

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

  // 处理连线右键点击事件，显示删除悬浮窗
  const handleLinkContextMenu = (args: any) => {
    const { link, event } = args;
    selectedLink.value = link;

    // 设置悬浮窗位置，适配碰撞
    if (!tableContainer.value) return;
    const rect = tableContainer.value.getBoundingClientRect();
    const left = event.clientX - rect.left + 10;
    const top = event.clientY - rect.top + 10;

    // 简单的碰撞检测，确保悬浮窗不会超出视口
    const popupWidth = 120;
    const popupHeight = 40;
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    linkDeletePopupPosition.value = {
      left: Math.min(left, containerWidth - popupWidth),
      top: Math.min(top, containerHeight - popupHeight),
    };
    setTimeout(() => {
      showLinkDeletePopup.value = true;
    }, 300);
  };

  // 关闭连线删除悬浮窗
  const closeLinkDeletePopup = () => {
    showLinkDeletePopup.value = false;
    selectedLink.value = null;
  };

  // 处理删除连线操作
  const handleLinkDelete = () => {
    if (selectedLink.value) {
      emit("on-more-action", "linkDelete", selectedLink.value);
      closeLinkDeletePopup();
    }
  };

  // 处理更多操作菜单中的操作
  const handleMoreAction = (actionKey: string) => {
    if (!selectedNode.value) return;

    // 发送on-more-action事件给父组件
    emit("on-more-action", actionKey, selectedNode.value);
    closeMoreActionsPopup();
  };

  // 添加子节点的方法
  const addChildNode = (tableInstance: any, parentRecord: ProjectNode) => {
    // 确保 parentRecord 存在
    if (!parentRecord) return;

    // 把父 id/no 拆成数组，例如 '1-2' -> [1, 2]
    const parentParts = parentRecord.id
      ? parentRecord.id.split("-").map((n) => parseInt(n, 10))
      : [];

    // 计算下一个子编号（数值），优先用 children 长度或解析最大子编号防止不连续的场景
    let nextChildNum = 1;
    if (parentRecord.children && parentRecord.children.length > 0) {
      // 用 children 中最后一个的编号（假设 children 已经按顺序且编号连续）
      const maxNum = parentRecord.children.reduce((m, c) => {
        const parts = (c.id || c.no).split("-");
        return Math.max(m, parseInt(parts[parts.length - 1], 10) || 0);
      }, 0);
      nextChildNum = maxNum + 1;
    }

    // 构造 new id/no，例如 parent '1-2' + nextChildNum 3 => '1-2-3'
    const newNo =
      parentParts.length > 0
        ? `${parentParts.join("-")}-${nextChildNum}`
        : `${nextChildNum}`;

    const newChild: ProjectNode = {
      id: newNo,
      no: newNo,
      name: "",
      priority: [],
      status: "",
      startDate: "",
      endDate: "",
      assignee: "",
      parentRecord: parentRecord.name,
      date: "",
      isChecked: false,
      children: [],
    };

    const tmpFlag = false;
    // 如果父组件提供了添加节点的钩子函数，调用它
    if (props.onAddNode && tmpFlag) {
      props.onAddNode(parentRecord, newChild);
    } else if (tableInstance) {
      // 否则使用默认的添加逻辑
      // 构造 addRecord 需要的索引路径（zero-based）
      // parentParts: [1,2] -> parent zero-based path = [0,1], new child's index = nextChildNum - 1
      const parentZeroPath = parentParts.map((n) => n - 1);
      const subIds = [...parentZeroPath, nextChildNum - 1];

      // 如果父节点没有 children，先创建（保证数据结构完整）
      if (!parentRecord.children) parentRecord.children = [];

      // 用 tableInstance.addRecord 插入（或者直接 push 到 tableOption.value.records）
      tableInstance.addRecord(newChild, subIds);
    }

    // 触发update事件，让父组件可以同步更新数据
    emit("update:initialData", originalData.value);
  };

  const initData = () => {
    if (props.initialData) {
      originalData.value = JSON.parse(JSON.stringify(props.initialData));
      // 设置总条数
      total.value = props.initialData.length;
    } else {
      originalData.value = [];
      total.value = 0;
    }
  };

  initData();

  // 判断是否包含中文字符
  const isChinese = (text: string): boolean => {
    if (!text) return false;
    // 匹配中文字符的正则表达式
    const chineseRegex = /[\u4e00-\u9fa5]/;
    return chineseRegex.test(text);
  };

  // 监听初始数据变化
  // 分页事件处理函数
  const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
    currentPage.value = 1; // 重置为第一页
    // 分页事件不涉及特定节点，第二个参数使用null
    emit("on-more-action", "paginationSizeChange", null as any);
  };

  const handleCurrentChange = (newPage: number) => {
    currentPage.value = newPage;
    // 分页事件不涉及特定节点，第二个参数使用null
    emit("on-more-action", "paginationCurrentChange", null as any);
  };

  watch(
    () => props.initialData,
    (newData) => {
      initData();
      if (tableInstance) {
        tableInstance.setRecords(originalData.value);
      }
      // 更新总条数
      if (newData) {
        total.value = newData.length;
      }
    },
    { deep: true },
  );

  // 应用行高设置
  const applyLineHeight = () => {
    // 检查是否是甘特图模式
    const isGanttMode = props.tableConfig?.mode === "gantt";

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
        if (isGanttMode && leftTableInstance) {
          // 设置左侧表格行高
          leftTableInstance.setRowHeight(rowIndex, height);
          setTimeout(() => {
            tableInstance.scenegraph.refreshAll();
          }, 100);
        } else if (!isGanttMode && tableInstance) {
          // 设置普通表格行高
          tableInstance.setRowHeight(rowIndex, height);
        }
      }
    });

    // 甘特图模式下，更新配置中的行高
    if (isGanttMode && props.tableConfig) {
      // tableInstance.updateOption(props.tableConfig);
    }
  };

  // 监听行高变化
  watch(
    () => props.lineHeight,
    () => {
      if (tableInstance) {
        applyLineHeight();
      }
    },
    { immediate: true },
  );

  // 基础列配置
  const baseColumns = computed<ColumnConfig[]>(() => []);
  // {
  //   field: props.fields[0].field,
  //   title: props.fields[0].name,
  //   width: props.fields[1].width || 160,
  //   tree: props?.tableConfig?.tree || false,
  //   style: {
  //     paddingLeft: (datum: TreeNodeData) => {
  //       const level = datum.level || 0;
  //       return `${level * 20 + 10}px`;
  //     },
  //   },
  // },
  // {
  //   field: props.fields[1].field,
  //   title: props.fields[1].name,
  //   width: props.fields[1].width || 220,
  //   // icon: ["view"],
  //   style: {
  //     color: "#0070BA",
  //     cursor: "pointer",
  //   },
  // },
  // ]);

  // 根据字段类型适配列配置
  const getColumnConfigByType = (field: DynamicField): ColumnConfig | null => {
    const tableLib =
      props.tableConfig?.mode === "gantt"
        ? VTableGantt.VRender
        : VTable.CustomLayout;
    const isGantt = props.tableConfig?.mode === "gantt";
    const tableField = field.field;
    const tableType = field.type;
    let isRouterField = false;
    if (props.routerFields) {
      isRouterField = props.routerFields.includes(tableField);
    }

    // 根据tableConfig.typeIconShow决定是否显示头部图标
    const getHeaderIconConfig = () => {
      const shouldShowIcon = props.tableConfig?.typeIconShow === true;
      return shouldShowIcon
        ? [
            {
              type: "svg",
              marginRight: 4,
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              svg: getIconForType(field.type),
            },
          ]
        : undefined;
    };
    if (isRouterField) {
      // console.log("props?.routerFields", props.routerFields);
      // console.log("isRouterField", isRouterField);
      // console.log("tableField", tableField);
    }

    if (!tableField) return null;

    // 操作项特殊处理
    if (tableField === "operations") {
      if (props?.tableConfig?.OperationsColumnMode === "text") {
        return {
          field: tableField,
          title: field.name,
          width: props?.tableConfig?.OperationsColumnWidth || "auto",
          style: {},
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);

            const containerContent = new VTable.CustomLayout.Group({
              opacity: 0.1,
              width: width,
              height: height,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "center",
            });

            props.moreActions?.length &&
              props.moreActions?.map(
                (action: { key: string; label: string }) => {
                  const tag = new VTable.CustomLayout.Tag({
                    text: action.label,
                    textStyle: {
                      fontSize: 13,
                      fontFamily: "sans-serif",
                      fill: "#333",
                      cursor: "pointer",
                    },
                    panel: {
                      visible: true,
                      lineWidth: 1,
                      cornerRadius: 8,
                      fill: "rgba(255,255,255,0.01)",
                    },
                    boundsPadding: [0, 0, 0, 10],
                    padding: [3, 6],
                    pickable: true,
                    fillPickable: true,
                    strokePickable: true,
                    childrenPickable: true,
                    pickMode: "imprecise",
                  });
                  tag.addEventListener("click", (e: any) => {
                    e.stopPropagation();
                    // console.log("click", e);
                    emit("on-more-action", action.key, row);
                  });
                  tag.addEventListener("mouseenter", (e: any) => {
                    e.stopPropagation();
                    tag.setAttributes({
                      textStyle: {
                        ...tag.attribute.textStyle,
                        fill: "#409EFF",
                      },
                    });
                    tableInstance.render();
                  });
                  tag.addEventListener("mouseleave", (e: any) => {
                    e.stopPropagation();
                    tag.setAttributes({
                      textStyle: {
                        ...tag.attribute.textStyle,
                        fill: "#333",
                      },
                    });
                    tableInstance.render();
                  });
                  (containerContent as any).add(tag);
                },
              );

            return {
              rootContainer: containerContent,
              renderDefault: false,
            };
          },
          headerIcon: [
            {
              type: "svg",
              name: "setting",
              positionType: VTable.TYPES.IconPosition.contentLeft,
              width: 14,
              height: 14,
              marginLeft: props?.tableConfig?.OperationsColumnWidth / 2 - 35,
              // marginRight: 4,
              // svg: settingIcon,
            },
          ],
        };
      } else {
        return {
          field: tableField,
          title: "",
          width: 34,
          style: {
            justifyContent: "center",
            padding: "0",
          },
          customLayout: props.moreActions?.length
            ? (args: any) => {
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
                  // 检查是否有可用的操作菜单
                  if (!hasAvailableActions.value) {
                    e.stopPropagation();
                    return;
                  }

                  // 获取点击位置
                  const rect = table.getCellRect(col, row);
                  const tableRect =
                    tableContainer.value?.getBoundingClientRect();
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
                    ) as ProjectNode;
                    currentRowIndex.value = row;
                    currentColIndex.value = col;

                    // 显示悬浮窗
                    setTimeout(() => {
                      showMoreActionsPopup.value = true;
                      moreActionsPopupPosition.value = popupPosition;
                    }, 100);
                  }

                  // console.log("更多操作", e);
                  e.stopPropagation();
                });

                return {
                  rootContainer: container,
                  renderDefault: false,
                };
              }
            : undefined,
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
      }
    }
    // 基于字段类型的配置
    switch (tableType) {
      case "text":
      case "textarea":
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          editor: props.tableConfig?.editable ? "input-editor" : undefined,
          fieldFormat(rec: ProjectNode) {
            return (rec as any)[tableField] || "";
          },
          style: {
            color: isRouterField ? "#0070BA" : "#333",
            cursor: isRouterField ? "pointer" : "default",
          },
          headerIcon: getHeaderIconConfig(),
        };

      case "multiple":
        // 多选类型配置
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          editor: props.tableConfig?.editable
            ? "custom-multiple-select"
            : undefined,
          fieldFormat(rec: ProjectNode) {
            return rec.priority.join(", ");
          },
          style: {
            justifyContent: "center",
            borderRadius: "4px",
          },
          headerIcon: getHeaderIconConfig(),
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row);
            const container = new tableLib.Group({
              width,
              height,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignContent: "center",
            });

            const containerContent = new tableLib.Group({
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

      case "single":
        // 单选类型配置
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          editor: props.tableConfig?.editable
            ? "custom-single-select"
            : undefined,
          fieldFormat(rec: ProjectNode) {
            return rec.status;
          },
          style: {
            justifyContent: "center",
            borderRadius: "4px",
          },
          headerIcon: getHeaderIconConfig(),
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row);
            const containerContent = new tableLib.Group({
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
      case "date":
        // 日期类型配置
        return {
          field: tableField,
          title: field.name,
          width: field.width || (originalData?.value?.length ? 140 : "auto"),
          editor: props.tableConfig?.editable
            ? "custom-element-plus-date"
            : undefined,
          fieldFormat(rec: ProjectNode) {
            return (rec as any)[tableField] || "";
          },
          style: {},
          headerIcon: getHeaderIconConfig(),
        };
      case "checkbox":
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          cellType: tableType,
          checked: field.checked || false,
          disable: field.disable || false,
          style: {
            justifyContent: "center",
          },
          headerIcon: getHeaderIconConfig(),
        };
      case "image":
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          cellType: tableType,
          keepAspectRatio: true,
          imageAutoSizing: true,
          style: {
            justifyContent: "center",
          },
          headerIcon: getHeaderIconConfig(),
        };
      case "link":
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          linkJump: field.linkJump || false,
          cellType: tableType,
          templateLink: field.tableField || "",
          style: {
            justifyContent: "center",
          },
          headerIcon: getHeaderIconConfig(),
        };
      case "switch":
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          cellType: tableType,
          checked: field.checked || false,
          disable: field.disable || false,
          checkedText: field.checkedText || "是",
          uncheckedText: field.uncheckedText || "否",
          style: {
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            switchStyle: {
              boxHeight: 20,
            },
          },
          headerIcon: getHeaderIconConfig(),
        };
      case "user":
        // 用户类型配置
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          editor: props.tableConfig?.editable
            ? "custom-multiple-select"
            : undefined,
          style: {
            justifyContent: "center",
          },
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const record = table.getRecordByRowCol(col, row) || {};
            console.log("record", record);
            console.log("filed", field);
            const name = String(record[tableField] || "");
            const shortName = shortNameOf(name);
            const bg = stringToColor(name || "unknown");
            const fg = pickReadableColor(bg);

            const cellRect = rect ||
              table.getCellRect(col, row) || { width: 180, height: 32 };
            const avatarSize = 25;
            const gap = 4; // 头像与名字间距

            // 根容器：横向排列，垂直居中
            const container = new tableLib.Group({
              width: cellRect.width,
              height: cellRect.height,
              display: "flex",
              alignItems: "center",
            });

            const blankContainer = new tableLib.Group({
              height: cellRect.height,
              width: 6,
            });
            // avatarGroup：用于把圆背景和文本叠在一起
            const avatarGroup = new tableLib.Group({
              width: avatarSize,
              height: avatarSize,
            });

            // 圆形背景（用 Rect + cornerRadius = width/2）
            const avatarBg = new tableLib.Rect({
              width: avatarSize,
              height: avatarSize,
              fill: bg,
              cornerRadius: avatarSize / 2,
              boundsPadding: [0, gap, 0, gap],
            });

            // 圆中文字：用 x/y 放到圆心，textAlign/textBaseline 做居中
            const avatarText = new tableLib.Text({
              text: shortName,
              fontSize: isChinese(name) ? Math.floor(avatarSize * 0.4) : Math.floor(avatarSize * 0.6),
              fontWeight: "400",
              fill: fg,
              textAlign: "center",
              textBaseline: "middle",
              x: avatarSize / 2,
              y: avatarSize / 2,
            });

            (avatarGroup as any).add(avatarBg);
            (avatarGroup as any).add(avatarText);

            // 名字文本
            const nameText = new tableLib.Text({
              text: name,
              fontSize: 14,
              fill: "#333",
              textBaseline: "middle",
              y: cellRect.height / 2,
              maxLineWidth: cellRect.width - avatarSize - 20, // 设置最大宽度，留出头像和间距的空间
              ellipsis: "...", // 超长显示省略号
            });

            (container as any).add(blankContainer);
            (container as any).add(avatarGroup);
            (container as any).add(nameText);

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
          headerIcon: getHeaderIconConfig(),
        };
      case "progress":
        return {
          field: tableField,
          title: field.name,
          width: field.width || (originalData?.value?.length ? 120 : "auto"),
          style: {},
          customLayout: (args: any) => {
            const { table, row, col, rect } = args;
            const { height, width } = rect || table.getCellRect(col, row);
            const record = table.getRecordByRowCol(col, row) || {};
            const progressValue = record.progress || 0;
            const barHeight = 4;
            const maxBarWidth = width - 52;
            const valueWidth = Math.round(maxBarWidth * (progressValue / 100));

            let container, progressContainer, bgBar, progressBar, progressText;
            // 根容器
            container = new tableLib.Group({
              width,
              height,
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
            });
            const blankContainer = new tableLib.Group({
              height: barHeight,
              width: 10,
            });

            const blankTxtyContainer = new tableLib.Group({
              height: barHeight,
              width: 4,
            });
            // 进度条容器
            progressContainer = new tableLib.Group({
              height: barHeight,
              width: maxBarWidth,
            });

            // 背景条
            bgBar = new tableLib.Rect({
              width: maxBarWidth,
              height: barHeight,
              fill: "#F2F2F2",
              // cornerRadius: barHeight / 2,
            });

            // 进度条
            progressBar = new tableLib.Rect({
              width: valueWidth,
              height: barHeight,
              fill: progressValue === 100 ? "#2BA471" : "#2BA471",
              // cornerRadius: barHeight / 2,
            });

            // 百分比文本
            progressText = new tableLib.Text({
              text: `${progressValue}%`,
              fontSize: 12,
              fill: "#141414",
              textAlign: "center",
              textBaseline: "middle",
            });
            if (isGantt) {
            }
            (container as any).add(blankContainer);
            (progressContainer as any).add(bgBar);
            (progressContainer as any).add(progressBar);
            (container as any).add(progressText);
            (container as any).add(blankTxtyContainer);
            (container as any).add(progressContainer);

            return {
              rootContainer: container,
              renderDefault: false,
            };
          },
          headerIcon: getHeaderIconConfig(),
        };
      case "fn":
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          fieldFormat(rec: ProjectNode) {
            return (rec as any)[tableField] || "";
          },
          style: {},
          headerIcon: getHeaderIconConfig(),
        };
      default:
        // 默认配置
        return {
          field: tableField,
          title: field.name,
          width: field.width || "auto",
          editor: props.tableConfig?.editable ? "input-editor" : undefined,
          fieldFormat(rec: ProjectNode) {
            return (rec as any)[tableField] || "";
          },
          style: {},
          headerIcon: getHeaderIconConfig(),
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
    return lum > 0.9 ? "#000" : "#fff";
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
      if (field.name === "id") return;

      // 如果字段不可见，跳过
      if (!field.invisible) return;

      const columnConfig = getColumnConfigByType(field);
      if (columnConfig) {
        if (props?.tableConfig?.tree?.enabled) {
          const currentColumnIndex =
            baseColumns.value.length + columnsConfig.length;
          if (currentColumnIndex === props.tableConfig.tree.column - 1) {
            columnConfig.tree = true;
            if (!columnConfig.style) columnConfig.style = {};
            if (props.tableConfig.tree.mode === "wbs") {
              columnConfig.icon = ["add", "view"];
              columnConfig.width = 240;
            }
            if (typeof columnConfig.style === "object") {
              columnConfig.style.paddingLeft = (datum: TreeNodeData) => {
                const level = datum.level || 0;
                return `${level * 20 + 10}px`;
              };
            }
          }
        }
        columnsConfig.push(columnConfig);
      }
    });

    // 默认显示操作列
    const shouldShowOperationsColumn =
      props?.tableConfig?.showOperationsColumn !== false;
    if (shouldShowOperationsColumn) {
      const operationsField = {
        id: 999,
        name: "操作",
        field: "operations",
        type: "string",
        invisible: true,
      } as DynamicField;

      const operationsColumn = getColumnConfigByType(operationsField);
      if (operationsColumn) {
        columnsConfig.push(operationsColumn);
      }
    }

    return columnsConfig;
  });

  let mode: any = {
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
      verticalSplitLine: {
        borderColor: "#f1e8fe",
        borderLineWidth: 1,
      },
    },
    cellInnerBorder: false,
  };

  if (props.tableConfig?.borderMode === "none") {
    mode.headerStyle.borderLineWidth = 0;
    mode.bodyStyle.borderLineWidth = [1, 0];
    mode.frameStyle.borderLineWidth = 0;
    mode.headerStyle = {
      bgColor: "#FFF",
      borderColor: "#FFF",
      borderLineWidth: 0,
      fontWeight: "normal",
      color: "#1f2329",
      fontSize: 14,
      hover: {
        cellBgColor: "#FFF",
      },
    };
  }

  const wbsTheme = VTable.themes.ARCO.extends(mode);
  function normalizePath(raw: number | number[] | undefined): number[] | null {
    if (raw == null) return null;
    return Array.isArray(raw) ? [...raw] : [raw];
  }

  function isValidTreePath(path: number[], records: any[]): boolean {
    if (!Array.isArray(path) || path.length === 0) return false;
    let cur: any = records;
    for (let i = 0; i < path.length; i++) {
      const idx = path[i];
      if (!Array.isArray(cur) && !Array.isArray(cur)) {
      }
      if (!cur || typeof idx !== "number" || idx < 0 || idx >= cur.length)
        return false;
      if (i === path.length - 1) return true;
      cur = cur[idx]?.children;
    }
    return true;
  }

  function isAncestorPath(ancestor: number[], descendant: number[]): boolean {
    if (ancestor.length >= descendant.length) return false;
    for (let i = 0; i < ancestor.length; i++) {
      if (ancestor[i] !== descendant[i]) return false;
    }
    return true;
  }
  // 定义表格选项
  const tableOption = computed(() => {
    // 默认配置
    const defaultConfig = {
      rowResizeType: "row",
      rowResizeMode: "all",
      dragOrder: {
        dragHeaderMode: "row",
      },
      frozenColCount: 3,
      rightFrozenColCount: 1,
      overscrollBehavior: "none",
      hover: {
        highlightMode: "row",
        disableHeaderHover: true,
      },
      heightMode: "standard",
      tooltip: {
        isShowOverflowTextTooltip: true,
      },
      autoFillWidth: true,
      autoFillHeight: false,
      menu: {
        contextMenuItems: ["添加子记录", "删除"],
      },
      defaultHeaderRowHeight: 36,
      defaultRowHeight: 36,
      records: originalData.value,
      columns: dynamicColumns.value,
      widthMode: "standard",
      autoWrapText: false,
      theme: wbsTheme,
      editCellTrigger: "doubleclick",
      enableLineBreak: true,
      // 配置树形结构的关键参数
      tree: {
        childrenKey: "children",
      },
      select: {
        disableHeaderSelect: true,
        disableSelect: false,
      },
      rowSeriesNumber: {
        width: "auto",
        // format: (col?: number, row?: number, table?: any) => {
        //   if (
        //     table &&
        //     typeof (table as any).getRecord === "function" &&
        //     row !== undefined
        //   ) {
        //     const record = (table as any).getRecord(row);
        //     return record ? record.id : "";
        //   }
        //   return "";
        // },
        format: () => {
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
      emptyTip: {
        text: "暂无数据",
        textStyle: {
          fontSize: 10,
          fontWeight: 400,
          color: "#646a73",
          lineHeight: 0,
        },
        icon: {
          width: 40,
          height: 30,
        },
      },
    } as Record<string, any>;

    // 创建最终配置对象，先应用用户自定义配置
    let finalConfig = defaultConfig;

    // 只有在甘特图模式或wbs模式下才使用dataSource
    const isGanttMode = props.tableConfig?.mode === "gantt";
    const isWbsMode = props.tableConfig?.tree?.mode === "wbs";
    if (isGanttMode || isWbsMode) {
      finalConfig.dataSource = dataSource;
    }

    if (props.tableConfig?.mode === "gantt") {
      // 应用用户自定义配置

      // 如果是甘特图模式，添加甘特图特定配置
      // 使用类型断言确保TypeScript允许添加甘特图特定属性
      // 重要：甘特图需要使用headerRowHeight和rowHeight而不是defaultHeaderRowHeight和defaultRowHeight
      // 先保存行高值，因为我们会从finalConfig中过滤掉这些属性
      const headerRowHeightValue = finalConfig.defaultHeaderRowHeight || 36;
      const rowHeightValue = finalConfig.defaultRowHeight || 36;

      finalConfig = {
        // 移除不兼容的属性
        ...Object.fromEntries(
          Object.entries(finalConfig).filter(
            ([key]) =>
              !["defaultHeaderRowHeight", "defaultRowHeight"].includes(key),
          ),
        ),
        // 添加甘特图特定的行高属性
        headerRowHeight: headerRowHeightValue,
        rowHeight: rowHeightValue,
        taskListTable: {
          dragOrder: {
            dragHeaderMode: "row",
          },
          menu: {
            contextMenuItems: ["添加子记录", "删除"],
          },
          tooltip: {
            isShowOverflowTextTooltip: true,
          },
          editCellTrigger: "doubleclick",
          theme: wbsTheme,
          columns: dynamicColumns.value,
          tableWidth: props.tableConfig?.taskListTable?.tableWidth || 360,
          minTableWidth: 100,
          select: {
            disableHeaderSelect: true,
            disableSelect: false,
          },
          hover: {
            highlightMode: "row",
            disableHeaderHover: true,
          },
        },
        tasksShowMode: VTableGantt.TYPES.TasksShowMode.Tasks_Separate,
        taskBar: {
          selectable: true,
          startDateField: "startDate",
          endDateField: "endDate",
          progressField: "progress",
          labelText: "{name} ({progress}%)",
          labelTextStyle: {
            fontFamily: "Arial, sans-serif",
            fontSize: 12,
            textAlign: "left",
            color: "#FFF",
          },
          hoverBarStyle: {
            barOverlayColor: "rgba(255, 255, 255, 0.3)",
          },
          barStyle: {
            width: 24,
            barColor: "#6366f1",
            completedBarColor: "#22c55e",
            cornerRadius: 2,
            borderWidth: 1,
            borderColor: "#d1d5db",
          },
          progressAdjustable: false,
          milestoneStyle: {
            labelText: "{name}",
            fillColor: (value: any) =>
              value.record.progress >= 100 ? "#597ef7" : "#d6e4ff",
            // borderColor: "",
            borderLineWidth: 0,
            width: 16,
            labelTextStyle: {
              fontSize: 12,
              color: "rgb(1, 43, 75)",
              textAlign: "left",
              padding: 10,
            },
          },
        },
        minDate: "",
        maxDate: "",
        frame: {
          verticalSplitLineMoveable: true,
          outerFrameStyle: {
            cornerRadius: 0,
          },
          verticalSplitLine: {
            lineWidth: 1,
            top: 0,
            lineColor: "#d1d5db",
          },
          verticalSplitLineHighlight: {
            lineColor: "#3b82f6",
            lineWidth: 1,
          },
        },
        timelineHeader: {
          verticalLine: {
            lineWidth: 1,
            lineColor: "#d1d5db",
          },
          horizontalLine: {
            lineWidth: 1,
            lineColor: "#d1d5db",
          },
          backgroundColor: "#fff",
          colWidth: 100,
          scales: computedScales.value,
        },
        timeline: {
          format: "YYYY-MM-DD",
          zoomLevels: [
            { label: "日", unit: "day", pixelPerUnit: 60 },
            { label: "周", unit: "week", pixelPerUnit: 60 * 7 },
            { label: "月", unit: "month", pixelPerUnit: 60 * 30 },
            { label: "季", unit: "quarter", pixelPerUnit: 60 * 90 },
            { label: "年", unit: "year", pixelPerUnit: 60 * 365 },
          ],
        },
        markLine: [
          {
            date: new Date().toISOString().slice(0, 10),
            content: " 今天 ",
            contentStyle: {
              color: "#fff",
            },
            style: {
              lineWidth: 0.7,
              lineColor: "red",
              lineDash: [5, 5],
            },
          },
        ],
        grid: {
          verticalLine: {
            lineWidth: 0.5,
            lineColor: "#e1e4e8",
          },
          horizontalLine: {
            lineWidth: 0.5,
            lineColor: "#e1e4e8",
          },
        },
        dependency: {
          linkCreatable: true,
          linkDeletable: true,
          links: [],
        },
      };
    }
    if (props.tableConfig) {
      const tableConfig = props.tableConfig;
      Object.keys(tableConfig).forEach((key) => {
        if (
          typeof tableConfig[key] === "object" &&
          tableConfig[key] !== null &&
          typeof finalConfig[key] === "object" &&
          finalConfig[key] !== null &&
          !Array.isArray(tableConfig[key]) &&
          !Array.isArray(finalConfig[key])
        ) {
          finalConfig[key] = { ...finalConfig[key], ...tableConfig[key] };
        } else {
          finalConfig[key] = tableConfig[key];
        }
      });
    }

    return finalConfig;
  }) as any;
  const dataSource = new VTable.data.CachedDataSource({
    records: originalData.value,
    canChangeOrder: canChangeOrder,
    // 执行拖拽后的数据调整
    changeOrder: changeOrder,
  });
  function canChangeOrder(sourceRow: number, targetRow: number) {
    const newTableInstance =
      props.tableConfig?.mode === "gantt" ? leftTableInstance : tableInstance;
    // console.log("canChangeOrder", sourceRow, targetRow);
    const sourcePath = newTableInstance.getRecordIndexByCell(
      0,
      sourceRow + newTableInstance.columnHeaderLevelCount,
    );
    const targetPath = newTableInstance.getRecordIndexByCell(
      0,
      targetRow + newTableInstance.columnHeaderLevelCount,
    );
    // 允许所有拖拽：子节点 -> 根，父节点 -> 其他节点
    if (!sourcePath || !targetPath) return false;
    return true;
  }
  function changeOrder(sourceRow: number, targetRow: number) {
    try {
      const newTableInstance =
        props.tableConfig?.mode === "gantt" ? leftTableInstance : tableInstance;
      const headerCount = newTableInstance.columnHeaderLevelCount || 0;
      // 原始路径
      const srcRaw = newTableInstance.getRecordIndexByCell(
        0,
        sourceRow + headerCount,
      );
      const tgtRaw = newTableInstance.getRecordIndexByCell(
        0,
        targetRow + headerCount,
      );
      const sourcePath = normalizePath(srcRaw)!;
      const targetPath = normalizePath(tgtRaw)!;

      // console.log("normalized paths:", sourcePath, targetPath);

      const records = (dataSource as any).records as any[];

      if (!isValidTreePath(sourcePath, records)) {
        // console.warn("无效 sourcePath", sourcePath);
        return;
      }
      if (!isValidTreePath(targetPath, records) && targetPath.length > 1) {
        if (!(targetPath.length === 1 && targetPath[0] === records.length))
          return;
      }

      // 防止把节点拖到自己子孙里面
      if (isAncestorPath(sourcePath, targetPath)) {
        // console.warn("不能把节点拖到自己的子孙里面");
        return;
      }
      // 要移动的 record
      const record = newTableInstance.getRecordByCell(
        0,
        sourceRow + headerCount,
      );
      const sourceParentPath = sourcePath.slice(0, -1);
      const targetParentPath =
        targetPath.length === 1 ? [] : targetPath.slice(0, -1);

      const sourceIndex = sourcePath[sourcePath.length - 1];
      let targetIndex = targetPath[targetPath.length - 1];

      const sameParent =
        sourceParentPath.length === targetParentPath.length &&
        sourceParentPath.every((v, i) => v === targetParentPath[i]);
      debugger;
      // 删除源节点
      if (sourcePath.length === 1) {
        (dataSource as any).deleteRecords([sourcePath]);
      } else {
        const no = record.no;
        const rs = removeChildNode(tableOption.value.records, no);
        if (rs) {
          tableInstance.setRecords(tableOption.value.records);
        }
      }
      if (sameParent && sourceIndex < targetIndex - 1) {
        targetIndex -= 1;
      } else if (
        !sameParent &&
        sourcePath[targetPath.length - 1] < targetPath[targetPath.length - 1]
      ) {
        targetIndex += 1;
      }

      // 插入节点
      let insertPath: number[];
      if (targetParentPath.length === 0) {
        insertPath = [targetIndex];
        (dataSource as any).addRecord(record, targetIndex);
      } else {
        insertPath = [...targetPath];
        insertPath[insertPath.length - 1] = targetIndex;
        (dataSource as any).addRecordsForTree([record], insertPath);
      }
      emit("update:initialData", originalData.value);
    } catch (err) {
      console.error("changeOrder 出现未捕获异常：", err);
    }
  }
  // 存储选中的节点ID集合
  const selectedNodeIds = ref<Set<string>>(new Set());

  // 递归选中所有子节点
  const selectChildNodes = (node: ProjectNode): void => {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        selectedNodeIds.value.add(child.id);
        selectChildNodes(child);
      });
    }
  };

  // 递归取消选中所有子节点
  const unselectChildNodes = (node: ProjectNode): void => {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        selectedNodeIds.value.delete(child.id);
        unselectChildNodes(child);
      });
    }
  };

  // 获取所有选中的节点
  const getSelectedNodes = (): ProjectNode[] => {
    const selectedNodes: ProjectNode[] = [];

    if (
      !tableInstance ||
      !originalData.value ||
      originalData.value.length === 0
    ) {
      return selectedNodes;
    }

    // 递归遍历所有节点，检查每个节点的复选框状态
    const findSelectedNodes = (
      nodes: ProjectNode[],
      parentPath: string[] = [],
    ) => {
      nodes.forEach((node, nodeIndex) => {
        const currentPath = [...parentPath, nodeIndex.toString()];
        let isChecked = false;
        try {
          let state = null;
          if (props.tableConfig?.mode === "gantt") {
            state = leftTableInstance?.getCellCheckboxState(0, nodeIndex + 1);
          } else {
            state = tableInstance?.getCellCheckboxState(0, nodeIndex + 1);
          }
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
      tableInstance.release();
      tableInstance = null;
    }

    // 根据表格模式注册对应的编辑器
    const mode = props.tableConfig?.mode === "gantt" ? "gantt" : "normal";
    registerCustomEditors(mode);

    if (props.tableConfig?.mode === "gantt") {
      // 创建gantt实例
      tableInstance = new VTableGantt.Gantt(
        tableContainer.value,
        tableOption.value,
      );
      leftTableInstance = tableInstance.taskListTableInstance;
      const data = (leftTableInstance as any).internalProps.dataSource;
      data.canChangeOrder = canChangeOrder;
      data.changeOrder = changeOrder;
      if (!leftTableInstance) {
        // console.warn(
        //   "[debug] leftTableInstance not available on gantt instance.",
        // );
        return;
      }
      // 添加单元格点击事件处理操作功能
      leftTableInstance.on("click_cell", (args: any) => {
        const { targetIcon, col, row, field } = args;
        // console.log("click_cell", args);

        // 如果点击的不是moreIcon，则关闭悬浮窗
        if (targetIcon && targetIcon.name !== "moreIcon") {
          closeMoreActionsPopup();
        }
        const cellInfo = leftTableInstance.getCellInfo(col, row);
        if (targetIcon) {
          if (targetIcon.name === "addIcon") {
            const record = cellInfo.originData;
            if (record) {
              addChildNode(leftTableInstance, record as ProjectNode);
              const status = leftTableInstance.getHierarchyState(col, row);
              if (status === "collapse") {
                leftTableInstance.toggleHierarchyState(col, row);
              }
            }
          } else if (targetIcon.name === "ViewIcon") {
            // tableInstance.startEditCell(col, row);
            const record = cellInfo?.originData;
            if (record) {
              emit("on-more-action", "view", cellInfo.originData);
            }
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
          if (!cellInfo) return;
          // 获取所有选中的节点并触发事件
          const selectedNodes = getSelectedNodes();
          if (cellInfo.originData) {
            emit("show:parentRecord", cellInfo.originData);
          }
          emit("show:records", selectedNodes);
        } else if (row > 0) {
          // 点击了操作列
          if (props.routerFields) {
            const hasKey = props.routerFields.includes(field);
            if (hasKey) {
              emit("on-more-action", field, cellInfo.originData);
            }
          }
        } else {
          // 点击了其他区域，关闭悬浮窗
          closeMoreActionsPopup();
          if (col === 1) {
            return;
          }
        }
      });

      leftTableInstance.on("dropdown_menu_click", (args: any) => {
        const { col, row } = args;
        const cellInfo = leftTableInstance.getCellInfo(col, row);

        if (args.menuKey === "添加子记录") {
          addChildNode(leftTableInstance, cellInfo.originData);
          const status = leftTableInstance.getHierarchyState(col, row);
          if (status === "collapse") {
            leftTableInstance.toggleHierarchyState(col, row);
          }
        } else if (args.menuKey === "删除") {
          //获取当前行数据
          const record = leftTableInstance.getCellInfo(args.col, args.row);
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
              leftTableInstance.setRecords(tableOption.value.records);
            }
          }

          // 触发update事件，让父组件可以同步更新数据
          emit("update:initialData", originalData.value);
        }
      });
      leftTableInstance.on("change_cell_value", (args: any) => {
        // 编辑单元格数据
        // console.log("change_cell_value", args);
        emit("on-more-action", "change_cell_value", args);
      });
      tableInstance.on("change_date_range", (args: any) => {
        // 编辑单元格数据
        // console.log("change_date_range", args);
        emit("on-more-action", "change_date_range", args);
      });
      tableInstance.on("create_dependency_link", (args: any) => {
        // console.log("create_dependency_link", args);
        const { link } = args;
        emit("on-more-action", "linkAdd", link);
      });
      tableInstance.on("contextmenu_dependency_link", (args: any) => {
        // console.log("contextmenu_dependency_link", args);
        handleLinkContextMenu(args);
      });
    } else {
      // 创建树表实例
      tableInstance = new VTable.ListTable(
        tableContainer.value,
        tableOption.value,
      );
      // 添加单元格点击事件处理操作功能
      tableInstance.on("click_cell", (args: any) => {
        const { targetIcon, col, row, field } = args;
        // console.log("click_cell", args);

        // 如果点击的不是moreIcon，则关闭悬浮窗
        if (targetIcon && targetIcon.name !== "moreIcon") {
          closeMoreActionsPopup();
        }
        const cellInfo = tableInstance.getCellInfo(col, row);
        if (targetIcon) {
          if (targetIcon.name === "addIcon") {
            const record = cellInfo.originData;
            if (record) {
              addChildNode(tableInstance, record as ProjectNode);
              const status = tableInstance.getHierarchyState(col, row);
              if (status === "collapse") {
                tableInstance.toggleHierarchyState(col, row);
              }
            }
          } else if (targetIcon.name === "ViewIcon") {
            // tableInstance.startEditCell(col, row);
            const record = cellInfo?.originData;
            if (record) {
              emit("on-more-action", "view", cellInfo.originData);
            }
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
          if (!cellInfo) return;
          // 获取所有选中的节点并触发事件
          const selectedNodes = getSelectedNodes();
          if (cellInfo.originData) {
            emit("show:parentRecord", cellInfo.originData);
          }
          emit("show:records", selectedNodes);
        } else if (row > 0) {
          // 点击了操作列
          if (props.routerFields) {
            const hasKey = props.routerFields.includes(field);
            if (hasKey) {
              // emit("view-node-detail", cellInfo.originData);
              emit("on-more-action", field, cellInfo.originData);
            }
          }
        } else {
          // 点击了其他区域，关闭悬浮窗
          closeMoreActionsPopup();
          if (col === 1) {
            return;
          }
        }
      });

      tableInstance.on("dropdown_menu_click", (args: any) => {
        const { col, row } = args;
        const cellInfo = tableInstance.getCellInfo(col, row);

        if (args.menuKey === "添加子记录") {
          addChildNode(tableInstance, cellInfo.originData);
          const status = tableInstance.getHierarchyState(col, row);
          if (status === "collapse") {
            tableInstance.toggleHierarchyState(col, row, true); // 添加第二个参数以满足方法签名要求
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
    }

    tableInstance.on("change_cell_value", (args: any) => {
      // 编辑单元格数据
      console.log("change_cell_value", args);
      emit("update:saveField", originalData.value);
    });

    applyLineHeight();
  };

  const updateNodeIds = (node: ProjectNode, newPrefix: string): void => {
    node.id = newPrefix;
    node.no = newPrefix;
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        const childPrefix = `${newPrefix}-${index + 1}`;
        updateNodeIds(child, childPrefix);
      });
    }
  };

  const removeChildNode = (list: ProjectNode[], no: string): boolean => {
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
  // 更新甘特图连线的方法
  const updateLinks = (links: any[]) => {
    // console.log("updateLinks", links);
    if (props.tableConfig?.mode === "gantt" && tableInstance) {
      try {
        links.forEach((link) => {
          const { linkedFromTaskKey, linkedToTaskKey, direction, id } = link;
          // console.log("linkedFromTaskKey", linkedFromTaskKey);
          // console.log("linkedToTaskKey", linkedToTaskKey);
          // console.log("direction", direction);
          tableInstance.addLink({
            id: id,
            type: direction,
            linkedFromTaskKey: linkedFromTaskKey,
            linkedToTaskKey: linkedToTaskKey,
          });
        });
        // console.log("连线已更新");
      } catch (error) {
        console.error("更新甘特图连线失败:", error);
      }
    }
  };
  const deleteLink = (link: any) => {
    // console.log("deleteLink", link);
    if (props.tableConfig?.mode === "gantt" && tableInstance) {
      tableInstance.deleteLink(link);
      // console.log("连线已删除");
      setTimeout(() => {
        tableInstance.scenegraph.refreshAll();
      }, 100);
    }
  };

  defineExpose({
    addChildNode,
    updateLinks,
    deleteLink,
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
      records: ProjectNode[],
      keyword: string,
    ): ProjectNode[] => {
      return records.reduce((acc: ProjectNode[], record) => {
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

  const handleClickOutsideLinkPopup = (event: MouseEvent) => {
    if (showLinkDeletePopup.value) {
      const popup = document.querySelector(".link-delete-popup");
      if (popup && !popup.contains(event.target as Node)) {
        closeLinkDeletePopup();
      }
    }
  };

  // 组件挂载时初始化表格
  onMounted(() => {
    // 立即初始化表格（因为默认显示需求列表选项卡）
    initTable();
    applyLineHeight();

    // 添加窗口滚动和调整大小事件监听器
    window.addEventListener("scroll", updatePopupPositionOnScrollOrResize);
    window.addEventListener("resize", updatePopupPositionOnScrollOrResize);

    // 添加点击外部区域关闭连线删除悬浮窗的事件监听器
    document.addEventListener("click", handleClickOutsideLinkPopup);

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

    // 监听initialData变化，动态更新表格数据
    watch(
      () => props.initialData,
      (newData) => {
        if (tableContainer.value) {
          originalData.value = JSON.parse(JSON.stringify(newData || []));
          initTable();
          // 数据更新后重新应用行高设置
          applyLineHeight();
        }
      },
      { deep: true },
    );

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
      tableInstance.release();
      tableInstance = null;
    }

    // 移除窗口滚动和调整大小事件监听器
    window.removeEventListener("scroll", updatePopupPositionOnScrollOrResize);
    window.removeEventListener("resize", updatePopupPositionOnScrollOrResize);

    // 移除点击外部区域关闭连线删除悬浮窗的事件监听器
    document.removeEventListener("click", handleClickOutsideLinkPopup);
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
      overflow: hidden;
      background-color: #ffffff;
      position: relative;
      height: calc(100vh - 90px);
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
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
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

  // 连线删除悬浮窗样式
  .link-delete-popup {
    position: absolute;
    z-index: 2000;
    pointer-events: auto;
    animation: fadeInScale 0.2s ease-out;
  }

  .popup-content {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid $border-color;
    overflow: hidden;
    min-width: 100px;
  }

  .delete-action {
    padding: 8px 16px;
    color: $danger-color;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 12px;
    text-align: center;

    &:hover {
      background-color: $hover-bg;
    }
  }
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 5px;
    border-top: 1px solid #f1e8fe;
  }
</style>
