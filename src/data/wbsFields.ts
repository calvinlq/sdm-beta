// WBS字段配置数据
import { lifecycleStatus, lifecycleType } from "@/interface/lifecycle.ts";
import type { FormItemRule } from "element-plus";
import {
  priorityOptions,
  type SelectOption,
  statusOptions,
  taskTypeOptions,
} from "@/data/wbsData.ts";

export interface DynamicField {
  id: number;
  name: string;
  field: string;
  type: string;
  invisible: boolean;
  defaultValue?: string;
  options?: SelectOption[];
  rules?: FormItemRule[];
  linkJump?: boolean;
  checked?: boolean;
  checkedText?: string;
  uncheckedText?: string;
  disable?: boolean;

  [key: string]: any;
}
export interface SoftwareField {
  id: number;
  name: string;
  field: string;
  type: string;
  invisible: boolean;
}

export interface SoftwareNode {
  id: number;
  name: string;
  version: string;
  executionType: string;
  creator: string;
  creatorTime: string;
  image?: string;
  description?: string;
  checked?: boolean;
}

export interface TabItem {
  id: number;
  title: string;
  content?: string;
  closable: boolean;
  icon?: string;
}

export interface ToolbarProps {
  import?: boolean;
  export?: boolean;
  batchDelete?: boolean;
  checkIn?: boolean;
  checkOut?: boolean;
  delete?: boolean;
  submit?: boolean;
  openWorkDir?: boolean;
  checkInFileSettings?: boolean;
  association?: boolean;
  edit?: boolean;
  unAssociation?: boolean;
}

// 定义按钮配置的类型
export interface ToolbarButton {
  key: keyof NonNullable<ToolbarProps>;
  label: string;
  type?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: any;
  handler: () => void;
  visible?: boolean;
}

export const mockFieldsResponse: DynamicField[] = [
  {
    id: 1,
    name: "需求名称",
    field: "name",
    type: "text",
    invisible: true,
    rules: [
      {
        required: true,
        message: "请输入需求名称",
        trigger: "blur",
      },
    ],
  },
  {
    id: 2,
    name: "优先级",
    field: "priority",
    type: "multiple",
    invisible: true,
    options: priorityOptions,
    rules: [
      {
        required: true,
        message: "请选择优先级",
        trigger: "change",
      },
    ],
  },
  {
    id: 3,
    name: "进展",
    field: "status",
    type: "radio",
    invisible: true,
    options: statusOptions,
  },
  {
    id: 4,
    name: "开始时间",
    field: "startDate",
    type: "date",
    invisible: true,
  },
  {
    id: 5,
    name: "结束时间",
    field: "endDate",
    type: "date",
    invisible: true,
  },
  {
    id: 6,
    name: "研发人员",
    field: "assignee",
    type: "user",
    invisible: true,
  },
  {
    id: 7,
    name: "父记录",
    field: "parentRecord",
    type: "text",
    invisible: true,
  },
  {
    id: 8,
    name: "复选框",
    field: "checkbox",
    type: "checkbox",
    invisible: true,
  },
  {
    id: 9,
    name: "延迟",
    field: "fn",
    type: "fn",
    invisible: true,
  },
  {
    id: 10,
    name: "备注",
    field: "remark",
    type: "text",
    invisible: true,
  },
  {
    id: 11,
    name: "任务类型",
    field: "taskType",
    type: "radio",
    invisible: true,
    options: taskTypeOptions,
  },
  {
    id: 12,
    name: "里程碑",
    field: "milestone",
    type: "switch",
    invisible: true,
  },
  {
    id: 13,
    name: "计划日期",
    field: "plannedDate",
    type: "date",
    invisible: true,
  },
  {
    id: 14,
    name: "预计工时",
    field: "estimatedHours",
    type: "text",
    invisible: true,
  },
  {
    id: 15,
    name: "剩余工时",
    field: "remainingHours",
    type: "text",
    invisible: true,
  },
  {
    id: 16,
    name: "软件工具",
    field: "softwareTool",
    type: "text",
    invisible: true,
  },
  {
    id: 17,
    name: "任务流程",
    field: "taskProcess",
    type: "radio",
    invisible: true,
  },
  {
    id: 18,
    name: "执行人",
    field: "executor",
    type: "radio",
    invisible: true,
  },
  {
    id: 19,
    name: "实际日期",
    field: "actualDate",
    type: "date",
    invisible: true,
  },
  {
    id: 20,
    name: "实际工时",
    field: "actualHours",
    type: "text",
    invisible: true,
  },
  {
    id: 21,
    name: "任务进度(%)",
    field: "taskSchedule",
    type: "type",
    invisible: true,
  },
];

export const defaultTabItems: TabItem[] = [
  {
    id: 1,
    title: "主任务视图",
    icon: "otherIcon",
    closable: false,
  },
  {
    id: 2,
    title: "需求列表",
    icon: "tableIcon",
    closable: false,
  },
];
export const mockFieldsSoftwareField: SoftwareField[] = [
  {
    id: 1,
    name: "软件名称",
    field: "name",
    type: "text",
    invisible: true,
  },
  {
    id: 2,
    name: "软件版本",
    field: "version",
    type: "text",
    invisible: true,
  },
  {
    id: 3,
    name: "执行类型",
    field: "executionType",
    type: "text",
    invisible: true,
  },
  {
    id: 4,
    name: "创建人",
    field: "creator",
    type: "text",
    invisible: true,
  },
  {
    id: 5,
    name: "创建时间",
    field: "creatorTime",
    type: "date",
    invisible: true,
  },
];

export const mockFieldsProjectResponse: DynamicField[] = [
  {
    id: 1,
    name: "项目编号",
    field: "projectNumber",
    type: "text",
    invisible: true,
  },
  { id: 26, name: "任务名称", field: "name", type: "text", invisible: true },
  {
    id: 2,
    name: "申请标题",
    field: "applicationTitle",
    type: "textarea",
    invisible: true,
  },
  {
    id: 4,
    name: "仿真学科",
    field: "simulationSubject",
    type: "text",
    invisible: true,
  },
  {
    id: 5,
    name: "项目经理",
    field: "projectManager",
    type: "text",
    invisible: true,
  },
  {
    id: 6,
    name: "几何模型版本",
    field: "geometricModelVersion",
    type: "text",
    invisible: true,
  },
  {
    id: 30,
    name: "进度",
    field: "progress",
    type: "progress",
    invisible: true,
  },
  {
    id: 7,
    name: "仿真执行人",
    field: "simulationExecutor",
    type: "text",
    invisible: true,
  },
  {
    id: 8,
    name: "结果判断",
    field: "resultJudgment",
    type: "text",
    invisible: true,
  },
  {
    id: 9,
    name: "风险等级",
    field: "riskLevel",
    type: "text",
    invisible: true,
  },
  {
    id: 10,
    name: "逼近方案数",
    field: "approachingSolutions",
    type: "number",
    invisible: true,
  },
  {
    id: 11,
    name: "优化意见",
    field: "optimizationOpinions",
    type: "text",
    invisible: true,
  },
  { id: 12, name: "提出人", field: "proposer", type: "user", invisible: true },
  {
    id: 13,
    name: "需求部门",
    field: "demandDepartment",
    type: "text",
    invisible: true,
  },
  {
    id: 14,
    name: "第一执行人",
    field: "firstExecutor",
    type: "text",
    invisible: true,
  },
  {
    id: 15,
    name: "第二执行人",
    field: "secondExecutor",
    type: "text",
    invisible: true,
  },
  {
    id: 16,
    name: "接收日期",
    field: "receiveDate",
    type: "date",
    invisible: true,
  },
  {
    id: 17,
    name: "执行开始日期",
    field: "startDate",
    type: "date",
    invisible: true,
  },
  {
    id: 18,
    name: "实际完成日期",
    field: "endDate",
    type: "date",
    invisible: true,
  },
  {
    id: 19,
    name: "项目工期(日)",
    field: "projectDuration",
    type: "number",
    invisible: true,
  },
  {
    id: 20,
    name: "任务状态",
    field: "taskStatus",
    type: "single",
    invisible: true,
  },
  {
    id: 21,
    name: "趋势图",
    field: "trend",
    type: "link",
    linkJump: true,
    invisible: true,
  },
  {
    id: 22,
    name: "是否有最优结果",
    field: "hasOptimalResult",
    type: "checkbox",
    checked: true,
    disable: true,
    invisible: true,
  },
  {
    id: 23,
    name: "是否已结束",
    field: "isEnded",
    type: "switch",
    checkedText: "是",
    uncheckedText: "否",
    checked: true,
    disable: true,
    invisible: true,
  },
  {
    id: 24,
    name: "剩余天数",
    field: "remainingDays",
    type: "number",
    invisible: true,
  },
  { id: 25, name: "任务序号", field: "no", type: "text", invisible: true },

  { id: 27, name: "优先级", field: "priority", type: "tags", invisible: true },
  { id: 28, name: "状态", field: "status", type: "text", invisible: true },
  { id: 29, name: "负责人", field: "assignee", type: "user", invisible: true },

  { id: 31, name: "项目类型", field: "type", type: "text", invisible: true },
  {
    id: 32,
    name: "项目描述",
    field: "projectDescription",
    type: "text",
    invisible: true,
  },
  {
    id: 33,
    name: "父项目",
    field: "parentRecord",
    type: "text",
    invisible: true,
  },
  { id: 34, name: "创建日期", field: "date", type: "date", invisible: true },
  { id: 35, name: "备注", field: "remark", type: "text", invisible: true },
];

export const mockFieldsLifeResponse: DynamicField[] = [
  {
    id: 1,
    name: "生命周期名称",
    field: "name",
    type: "link",
    invisible: true,
  },
  {
    id: 2,
    name: "生命周期类型",
    field: "typeName",
    type: "select",
    invisible: true,
  },
  {
    id: 3,
    name: "状态",
    field: "statusName",
    type: "text",
    invisible: true,
  },
  {
    id: 4,
    name: "创建者",
    field: "creatorName",
    type: "user",
    invisible: true,
  },
  {
    id: 5,
    name: "创建时间",
    field: "createTime",
    type: "date",
    invisible: true,
  },
  {
    id: 6,
    name: "修改者",
    field: "modifierName",
    type: "user",
    invisible: true,
  },
  {
    id: 7,
    name: "修改时间",
    field: "modifyTime",
    type: "date",
    invisible: true,
  },
  {
    id: 8,
    name: "生命周期描述",
    field: "remark",
    type: "textarea",
    invisible: true,
  },
];

export const mockFieldsLifeCreate: DynamicField[] = [
  {
    id: 1,
    name: "生命周期名称",
    field: "name",
    type: "text",
    invisible: true,
    rules: [
      {
        required: true,
        message: "请输入生命周期名称",
      },
    ],
  },
  {
    id: 2,
    name: "生命周期类型",
    field: "type",
    type: "select",
    invisible: true,
    options: [
      {
        label: "项目",
        value: lifecycleType.Project,
      },
      {
        label: "任务",
        value: lifecycleType.Task,
      },
      {
        label: "数据流",
        value: lifecycleType.DataFlow,
      },
    ],
    rules: [
      {
        required: true,
        message: "请选择生命周期类型",
      },
    ],
  },
  {
    id: 3,
    name: "状态",
    field: "status",
    type: "select",
    invisible: true,
    options: [
      {
        label: "开启",
        value: lifecycleStatus.Normal,
      },
      {
        label: "关闭",
        value: lifecycleStatus.Disable,
      },
    ],
  },
  {
    id: 8,
    name: "生命周期描述",
    field: "remark",
    type: "textarea",
    invisible: true,
  },
];

export const mockFieldsLifecycleStatus: DynamicField[] = [
  {
    id: 1,
    name: "状态图标",
    field: "icon",
    type: "icon",
    invisible: true,
  },
  {
    id: 2,
    name: "状态名",
    field: "name",
    type: "text",
    invisible: true,
  },
  {
    id: 3,
    name: "状态映射",
    field: "code",
    type: "text",
    invisible: true,
  },
  {
    id: 4,
    name: "创建人",
    field: "creatorName",
    type: "user",
    invisible: true,
  },
  {
    id: 5,
    name: "创建时间",
    field: "createTime",
    type: "data",
    invisible: true,
  },
];

export const mockCreateFieldsLifecycleStatus: DynamicField[] = [
  {
    id: 0,
    name: "id",
    field: "id",
    type: "text",
    invisible: false,
  },
  {
    id: 2,
    name: "状态名",
    field: "name",
    type: "text",
    invisible: true,
    rules: [
      {
        required: true,
        message: "请输入状态名",
      },
    ],
  },
  {
    id: 1,
    name: "状态图标",
    field: "icon",
    type: "iconSelect",
    invisible: true,
    rules: [
      {
        required: true,
        message: "请选择状态图标",
      },
    ],
  },
  {
    id: 3,
    name: "颜色",
    field: "color",
    type: "color",
    invisible: true,
    defaultValue: "#2e405e",
  },
  {
    id: 4,
    name: "状态映射",
    field: "code",
    type: "select",
    invisible: true,
    options: [
      {
        label: "带开始",
        value: "await",
      },
    ],
  },
];
