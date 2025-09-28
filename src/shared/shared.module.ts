import { Module } from '@nestjs/common';
import { ResponseHelper } from './helpers/response-helper';
import { DbOrmConfigModule } from './config/db-orm-config.module';
import { DbRawConfigModule } from './config/db-raw-config.module';
import {TokenHelper} from "./helpers/token-helper.service";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {AuthGuard} from "./guards/auth.guard";
import * as dotenv from 'dotenv';
import {ConfigModule, ConfigService} from "@nestjs/config";

dotenv.config();

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRATION') || '3600s',
                },
            }),
        }),
        DbOrmConfigModule,
        DbRawConfigModule,
    ],
    providers: [
        ResponseHelper,
        TokenHelper,
        AuthGuard
    ],
    exports: [
        ResponseHelper,
        DbOrmConfigModule,
        DbRawConfigModule,
        AuthGuard,
        TokenHelper,
        JwtModule
    ],
})
export class SharedModule {}
