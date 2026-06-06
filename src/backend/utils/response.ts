export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  code: number;
  data?: T;
}

export function success<T>(data?: T, message: string = '操作成功', code: number = 200): ApiResponse<T> {
  return {
    success: true,
    message,
    code,
    data,
  };
}

export function error(message: string = '操作失败', code: number = 500): ApiResponse<null> {
  return {
    success: false,
    message,
    code,
    data: null,
  };
}
