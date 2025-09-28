
export type ApiResponseInterface<T> = {
  MESSAGE: string;
  STATUS_CODE: number;
  EXCEPTION?:string;
  CONTENT: T;
  SUCCESS: boolean;
  TOKEN?:string;
};