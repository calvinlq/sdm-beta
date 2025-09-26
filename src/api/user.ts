import { http } from "../utils/request";

// 用户相关API接口

// 用户登录
interface LoginParams {
  username: string;
  password: string;
}

interface LoginResult {
  token: string;
  userInfo: {
    id: number;
    username: string;
    avatar?: string;
    roles: string[];
  };
}

export const login = (params: LoginParams): Promise<LoginResult> => {
  return http.post("/api/auth/login", params);
};

// 获取用户信息
export const getUserInfo = (): Promise<any> => {
  return http.get("/api/user/info");
};

// 登出
export const logout = (): Promise<any> => {
  return http.post("/api/auth/logout");
};

// 获取用户列表
interface GetUserListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: number;
}

export const getUserList = (params: GetUserListParams): Promise<any> => {
  return http.get("/api/users", params);
};

// 创建用户
export const createUser = (data: any): Promise<any> => {
  return http.post("/api/users", data);
};

// 更新用户
export const updateUser = (id: number, data: any): Promise<any> => {
  return http.put(`/api/users/${id}`, data);
};

// 删除用户
export const deleteUser = (id: number): Promise<any> => {
  return http.delete(`/api/users/${id}`);
};
