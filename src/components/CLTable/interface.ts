import type { FormItemRule } from "element-plus";

// 定义通用的列配置接口
interface ColumnConfig {
  field: string;
  title: string;
  width: number | string;
  editor?: string;
  fieldFormat?: (rec: ProjectNode) => string;
  style: any;
  tree?: boolean;
  icon?: string[];
  headerIcon?: any[];
  customLayout?: any;
  cellType?: string;
  disable?: boolean;
  checked?: boolean;
  checkedText?: string;
  uncheckedText?: string;
  linkJump?: boolean;
  [key: string]: any;
}
// 定义节点数据类型接口
interface TreeNodeData {
  level?: number;
  priority?: string[];
  status?: string;
  [key: string]: any;
}

interface DynamicField {
  id: number;
  name: string;
  field: string;
  type: string;
  invisible: boolean;
  options?: Array<{ label: string; value: string }>;
  rules?: FormItemRule[];
  checked?: boolean;
  disable?: boolean;
  checkedText?: string;
  uncheckedText?: string;
  [key: string]: any;
}

interface ProjectNode {
  id: string;
  no: string;
  name: string;
  priority: string[];
  status: string;
  startDate: string;
  endDate: string;
  assignee: string;
  parentRecord?: string;
  date: string;
  delay?: string;
  remark?: string;
  checkbox?: {
    text: string;
    checked: boolean;
    disable: boolean;
  };
  children?: ProjectNode[];
  // 添加索引签名以支持动态属性访问
  [key: string]: any;
}

// export all interface
export type { ColumnConfig, TreeNodeData, DynamicField, ProjectNode };
