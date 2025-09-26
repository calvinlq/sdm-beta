import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.PUBLIC_VITE_APP_API_BASE_URL || "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    // 根据后端接口规范处理响应数据
    if (data.code === 200) {
      return data.data;
    } else {
      // 处理错误
      console.error("Request error:", data.message);
      return Promise.reject(new Error(data.message || "Request failed"));
    }
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized, please login again");
          // 清除token
          localStorage.removeItem("token");
          const currentPath = window.location.pathname + window.location.search;
          localStorage.setItem("redirectPath", currentPath);
          window.location.href = "/";
          break;
        case 403:
          console.error("Access denied");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("Request failed");
      }
    } else if (error.request) {
      console.error("Network error");
    } else {
      console.error("Request configuration error");
    }
    return Promise.reject(error);
  },
);

// 导出常用的请求方法
export const http = {
  get<T = any>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.get(url, { params, ...config });
  },

  post<T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.post(url, data, config);
  },

  put<T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.put(url, data, config);
  },

  delete<T = any>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.delete(url, { params, ...config });
  },

  patch<T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.patch(url, data, config);
  },
};

export default request;
