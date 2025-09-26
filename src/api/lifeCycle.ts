import { http } from "@/utils/request";

import type {
  LifeCycleEntity,
  PageResultLifeCycleEntity,
  createLifeCycleParams,
  listLifeCycleParams,
  createOrEditLifecycleStatusParams,
  listLifeCycleStatusParams,
  listLifeCycleStatusResponse,
  getLifecycleStatusResponse,
  Datum,
} from "@/interface/lifecycle.ts";
// 创建生命周期
export const createLifeCycle = (
  params: createLifeCycleParams,
): Promise<LifeCycleEntity> => {
  return http.post("/lifecycle/create", params);
};

export const updateLifeCycle = (
  params: createLifeCycleParams,
): Promise<null> => {
  return http.put("/lifecycle/edit", params);
};

export const deleteLifeCycle = (id: string): Promise<null> => {
  return http.delete(`/lifecycle/${id}`);
};

export const copyLifeCycle = (id: string): Promise<null> => {
  return http.post(`/lifecycle/copy/${id}`);
};

export const getLifeCycle = (id: string): Promise<LifeCycleEntity> => {
  return http.get(`/lifecycle/${id}`);
};

export const listLifeCycle = (
  params: listLifeCycleParams,
): Promise<PageResultLifeCycleEntity> => {
  return http.post(`/lifecycle/list`, params);
};

// 工作项列表
export const listLifeGlobalStatus = (
  params: listLifeCycleStatusParams,
): Promise<listLifeCycleStatusResponse> => {
  return http.post(`/lifeGlobalStatus/list`, params);
};

// 工作项创建
export const createLifeGlobalStatus = (
  params: createOrEditLifecycleStatusParams,
): Promise<getLifecycleStatusResponse> => {
  return http.post(`/lifeGlobalStatus/create`, params);
};

// 工作项编辑
export const editLifeGlobalStatus = (
  params: createOrEditLifecycleStatusParams,
): Promise<getLifecycleStatusResponse> => {
  return http.put(`/lifeGlobalStatus/edit`, params);
};

// 工作项删除
export const deleteLifeGlobalStatus = (id: string): Promise<null> => {
  return http.delete(`/lifeGlobalStatus/${id}`);
};

// 工作项查询
export const getLifeGlobalStatus = (
  id: string,
): Promise<getLifecycleStatusResponse> => {
  return http.post(`/lifeGlobalStatus/${id}`);
};

// 查询规则状态列表

export const getLifecycleFieldList = (): Promise<Datum[]> => {
  return http.get(`/lifecycle/fieldList`);
};
