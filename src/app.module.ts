import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {SqlSanitizationModule} from './shared/middlewares/sql-sanitization.module';
import {SqlSantizationMiddleware} from './shared/middlewares/sql-santization.middleware';
import {ThrottlerModule, ThrottlerGuard} from '@nestjs/throttler';
import * as path from 'path';
import {APP_FILTER, APP_GUARD, RouterModule} from '@nestjs/core';
import {AppGlobalExceptionFilter} from './shared/filters/app-global-exception/app-global-exception.filter';
import {LoggerModule} from './shared/helpers/log-helper.module';
import {RequestLoggerMiddleware} from "./shared/middlewares/request-logger.middleware";
import {SharedModule} from "./shared/shared.module";
import {ControllerModule} from "./controllers/controller.module";
import {ResponseMonitorMiddleware} from "./shared/middlewares/response-monitor.middleware";
import {ApplicationCorsMiddleware} from "./shared/middlewares/application-cors.middleware";


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [
                path.resolve(process.cwd(), 'environments', `.env.${process.env.NODE_ENV}`),
                path.resolve(process.cwd(), 'environments', '.env'),
            ],
        }),
        SharedModule,
        ControllerModule,
        LoggerModule,
        SqlSanitizationModule.forRoot({
            exclude: [],
            maxBytes: 1024 * 1024,
            log: 'warn',
        }),
        ThrottlerModule.forRoot([{
            name: 'default',
            ttl: 60,
            limit: 100,
        }]),
    ],
    controllers: [AppController],
    providers: [AppService,
        {provide: APP_GUARD, useClass: ThrottlerGuard},
        {provide: APP_FILTER, useClass: AppGlobalExceptionFilter}
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SqlSantizationMiddleware).forRoutes('*');
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
        consumer.apply(ResponseMonitorMiddleware).forRoutes('*');
        consumer.apply(ApplicationCorsMiddleware).forRoutes('*');
    }
}
