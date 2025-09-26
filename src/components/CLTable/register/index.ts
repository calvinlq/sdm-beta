import * as VTable from "@visactor/vtable";
import * as VTableGantt from "@visactor/vtable-gantt";
import * as VTableEditors from "@visactor/vtable-editors";
import { CLSelectEditor } from "./editors/CLSelectEditor.ts";
import { CLDateEditor } from "./editors/CLDateEditor.ts";
import { plusIcon, viewIcon, moreIcon } from "@/utils/SvgIcons";
import {
  singleOptions,
  multipleOptions,
  priorityColors,
  statusColors,
} from "./options.ts";

/**
 * 注册所有自定义编辑器和图标
 * @param mode 表格模式：'normal' 或 'gantt'
 */
export const registerCustomEditors = (mode: "normal" | "gantt" = "normal") => {
  // 确定要使用的表格库
  const tableLib = mode === "gantt" ? VTableGantt.VTable : VTable;

  // 注册基础输入编辑器
  const inputEditor = new VTableEditors.InputEditor();
  tableLib.register.editor("input-editor", inputEditor);

  // 日期编辑器
  const customDateEditor = new CLDateEditor({
    valueFormat: "YYYY-MM-DD",
    type: "date",
  });
  tableLib.register.editor("custom-element-plus-date", customDateEditor);

  // 单选编辑器
  const singleSelectEditor = new CLSelectEditor({
    options: singleOptions,
    placeholder: "请选择",
    multiple: false,
  });
  tableLib.register.editor("custom-single-select", singleSelectEditor);

  // 多选编辑器
  const multipleSelectEditor = new CLSelectEditor({
    options: multipleOptions,
    placeholder: "请选择",
    multiple: true,
  });
  tableLib.register.editor("custom-multiple-select", multipleSelectEditor);

  // 添加图标
  tableLib.register.icon("add", {
    type: "svg",
    svg: plusIcon,
    width: 16,
    height: 16,
    name: "addIcon",
    positionType: tableLib.TYPES.IconPosition.right,
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
      placement: tableLib.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });

  // 查看图标
  tableLib.register.icon("view", {
    type: "svg",
    svg: viewIcon,
    width: 16,
    height: 16,
    name: "ViewIcon",
    positionType: tableLib.TYPES.IconPosition.right,
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
      placement: tableLib.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });

  // 更多图标
  tableLib.register.icon("more", {
    type: "svg",
    svg: moreIcon,
    width: 20,
    height: 20,
    name: "moreIcon",
    positionType: tableLib.TYPES.IconPosition.right,
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
      placement: tableLib.TYPES.Placement.top,
      disappearDelay: 2000,
    },
  });
};

// 单独导出颜色映射
export { priorityColors, statusColors };

export default {
  registerCustomEditors,
  CLSelectEditor,
  CLDateEditor,
};
