export interface SelectOption {
  value: string | number;
  label: string;
  tag?: string;
}

export const singleOptions: SelectOption[] = [
  { value: "已完成", label: "已完成", tag: "已完成" },
  { value: "进行中", label: "进行中", tag: "进行中" },
  { value: "未开始", label: "未开始", tag: "未开始" },
];

export const multipleOptions: SelectOption[] = [
  { value: "P0", label: "P0", tag: "P0" },
  { value: "P1", label: "P1", tag: "P1" },
  { value: "P2", label: "P2", tag: "P2" },
  { value: "P3", label: "P3", tag: "P3" },
  { value: "P4", label: "P4", tag: "P4" },
  { value: "P5", label: "P5", tag: "P5" },
];

// 优先级颜色映射
export const priorityColors: Record<string, string> = {
  P0: "#ff4d4f",
  P1: "#fa8c16",
  P2: "#1890ff",
  P3: "#52c41a",
  P4: "pink",
  P5: "orange",
};

// 状态颜色映射
export const statusColors: Record<string, string> = {
  已完成: "#52c41a",
  进行中: "#1890ff",
  未开始: "#8c8c8c",
};
