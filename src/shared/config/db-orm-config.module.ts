import { Global, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbTransactionService } from '../services/db-transaction.service';
import { DataSource } from 'typeorm';
import { OrmDbHelperService } from '../helpers/orm-db-helper.service';

@Global()
@Module({
  imports: [
    // Ensure ConfigModule is available for the useFactory below
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const ssl =
          (cfg.get('DB_SSL', 'false') as string).toLowerCase() === 'true'
            ? { rejectUnauthorized: false }
            : false;

        return {
          type: 'postgres' as const,
          host: cfg.get<string>('DB_HOST', 'localhost'),
          port: parseInt(cfg.get<string>('DB_PORT', '5432')!, 10),
          database: cfg.get<string>('DB_NAME', ''),
          username: cfg.get<string>('DB_USER', ''),
          password: String(cfg.get<string>('DB_PASS', '') ?? '').trim(), // always a string
          ssl,
          autoLoadEntities: true,
          synchronize: false,
          logging: ['error', 'warn'],
          extra: {
            application_name: cfg.get('APP_NAME', 'central-backend'),
            statement_timeout: parseInt(cfg.get('PG_STATEMENT_TIMEOUT', '30000')!, 10),
            query_timeout: parseInt(cfg.get('PG_QUERY_TIMEOUT', '30000')!, 10),
            idle_in_transaction_session_timeout: parseInt(cfg.get('PG_IDLE_TX_TIMEOUT', '30000')!, 10),
            keepAlive: true,
            connectionTimeoutMillis: parseInt(cfg.get('DB_CONN_MS', '5000')!, 10),
            idleTimeoutMillis: parseInt(cfg.get('DB_IDLE_MS', '30000')!, 10),
            max: parseInt(cfg.get('DB_POOL_MAX', '10')!, 10),
          },
        };
      },
    }),
  ],
  providers: [DbTransactionService,OrmDbHelperService],
  exports: [TypeOrmModule, DbTransactionService,OrmDbHelperService],
})
export class DbOrmConfigModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbOrmConfigModule.name);
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query('SELECT 1');
    this.logger.log('TypeORM/Postgres handshake OK');
  }

  async onModuleDestroy() {
    await this.dataSource.destroy();
    this.logger.log('TypeORM DataSource closed');
  }
}
