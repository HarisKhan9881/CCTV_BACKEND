import { InjectionToken } from '@nestjs/common';

export type SqlSanitizationMiddlewareOptions = {
  exclude?: (string | RegExp)[];
  maxBytes?: number;
  headerKeys?: string[];
  log?: 'warn' | 'error' | false;
  blockMessage?: string;
};

export const SQLI_OPTIONS: InjectionToken = Symbol('SQLI_OPTIONS');
