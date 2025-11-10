export type BaseResponse<T> = {
  success: boolean;
  message: string;
  object?: T | null;
  errors?: string[] | null;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  object: T[];
  pageNumber: number;
  pageSize: number;
  totalSize: number;
  errors?: string[] | null;
};

export function ok<T>(message: string, object?: T | null): BaseResponse<T> {
  return { success: true, message, object: object ?? null, errors: null };
}

export function created<T>(message: string, object?: T | null): BaseResponse<T> {
  return { success: true, message, object: object ?? null, errors: null };
}

export function fail(message: string, errors?: string[] | null, object?: unknown | null): BaseResponse<unknown> {
  return { success: false, message, object: (object as unknown) ?? null, errors: errors ?? null };
}



