export interface ApiSuccess<T, M = undefined> {
  success: true;
  data: T;
  meta?: M;
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T, M = undefined> = ApiSuccess<T, M> | ApiError;
