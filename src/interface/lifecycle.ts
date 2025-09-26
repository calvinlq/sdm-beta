export interface createLifeCycleParams {
  id?: string;
  /**
   * 画布布局
   */
  layout?: string;
  /**
   * 规则模型
   */
  model?: string;
  /**
   * 名称
   */
  name?: { [key: string]: string };
  /**
   * 描述
   */
  remark?: string;
  /**
   * 状态
   */
  status?: lifecycleStatus;
  /**
   * 状态卡片
   */
  statusCard?: string;
  /**
   * 类型
   */
  type?: lifecycleType;
}

/**
 * 状态
 */
export enum lifecycleStatus {
  Disable = "DISABLE",
  Normal = "NORMAL",
}

/**
 * 类型
 */
export enum lifecycleType {
  DataFlow = "DATA_FLOW",
  Project = "PROJECT",
  Task = "TASK",
}

export interface LifeCycleEntity {
  deleted?: string;
  id?: string;
  /**
   * 布局
   */
  layout?: string;
  /**
   * 规则模型json
   */
  model?: string;
  /**
   * 生命周期名
   */
  name?: string;
  /**
   * 描述
   */
  remark?: string;
  /**
   * 状态
   */
  status?: lifecycleStatus;
  /**
   * 节点卡片
   */
  statusCard?: string;
  /**
   * 类型
   */
  type?: lifecycleType;

  [property: string]: any;
}

/**
 * listLifeCycleParams
 */
export interface listLifeCycleParams {
  allFields?: string[];
  conditions?: QueryCondition[];
  logic?: string;
  pageNo?: number;
  pageSize?: number;
  sortParams?: SortParam[];

  [property: string]: any;
}

/**
 * QueryCondition
 */
export interface QueryCondition {
  field: string;
  operator?: string;
  value: { [key: string]: any };

  [property: string]: any;
}

/**
 * SortParam
 */
export interface SortParam {
  asc?: boolean;
  field?: string;

  [property: string]: any;
}

export interface PageResultLifeCycleEntity {
  pageNo?: number;
  pageSize?: number;
  result?: LifeCycleEntity[];
  total?: number;

  [property: string]: any;
}

export interface createOrEditLifecycleStatusParams {
  /**
   * 映射状态
   */
  code?: string;
  /**
   * 颜色
   */
  color: string;
  /**
   * 图标
   */
  icon: string;
  id?: string;
  /**
   * 名称
   */
  name?: { [key: string]: string };

  [property: string]: any;
}

export interface listLifeCycleStatusParams {
  /**
   * 筛选参数
   */
  conditions: QueryCondition[];
  /**
   * 默认and
   */
  logic: string;
  /**
   * 页码
   */
  pageNo: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 排序参数
   */
  sortParams: SortParam[];

  [property: string]: any;
}

export interface LifeGlobalStatusVo {
  /**
   * 映射状态
   */
  code?: string;
  /**
   * 颜色
   */
  color: string;
  /**
   * 图标
   */
  icon: string;
  id?: string;
  /**
   * 名称
   */
  name?: { [key: string]: string };

  [property: string]: any;
}

export interface listLifeCycleStatusResponse {
  code: string;
  data: LifeGlobalStatusVo[];
  message: string;

  [property: string]: any;
}

export interface getLifecycleStatusResponse {
  code: string;
  data: LifeGlobalStatusVo[];
  message: string;

  [property: string]: any;
}

export interface fieldsListResponse {
  code?: number;
  data: Datum[];
  message?: string;

  [property: string]: any;
}

export interface Datum {
  code: string;
  name: string;
  values: Value[];

  [property: string]: any;
}

/**
 * 选项
 */
export interface Value {
  code: string;
  displayName: string;

  [property: string]: any;
}
