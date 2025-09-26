// 定义标签数据结构
export interface TabItem {
  id: number;
  title: string;
  content?: string;
  closable: boolean;
}

// 定义任务数据结构
export interface Task {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  priority?: string;
  status?: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
}

// 定义字段接口（从后端获取的字段类型）
export interface DynamicField {
  id: number;
  name: string;
  field: string;
  type: string;
  invisible: boolean;
}
