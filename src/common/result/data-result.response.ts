// IDataResultResponse.ts
export interface IDataResultResponse<T> {
  status: number;
  message: string;
  data: T;
}
