export interface statusType {
  name: string;
  color?: string;
  backgroundColor?: string;
  icon: string;
}

export interface lifecycleBaseNodeDataType {
  statusInfo: statusType;
  nodeInfo: any;
}
