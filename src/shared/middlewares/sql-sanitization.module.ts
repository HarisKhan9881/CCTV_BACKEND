import { DynamicModule, Global, Module } from '@nestjs/common';
import { SQLI_OPTIONS, SqlSanitizationMiddlewareOptions } from '../types/sql-sanitization.token';
import { SqlSantizationMiddleware } from './sql-santization.middleware';

@Global()
@Module({})
export class SqlSanitizationModule {

  static forRoot(options: SqlSanitizationMiddlewareOptions = {}): DynamicModule {
    const optsProvider = { provide: SQLI_OPTIONS, useValue: { log: 'warn', ...options } };
    return {
      module: SqlSanitizationModule,
      providers: [optsProvider, SqlSantizationMiddleware],
      exports: [SqlSantizationMiddleware, SQLI_OPTIONS],
    };
  }

}
