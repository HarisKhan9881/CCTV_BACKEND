import {
  Global,
  Module,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { getPgConfig } from './db-raw-config';

export const PG_POOL = Symbol('PG_POOL');

@Injectable()
class PgPoolOwner implements OnModuleInit, OnModuleDestroy {
  readonly pool: Pool;
  private readonly logger = new Logger(PgPoolOwner.name);

  constructor() {
    this.pool = new Pool(getPgConfig());
    this.pool.on('error', (e) => console.error('[pg] idle client error', e));
  }

  async onModuleInit() {
    await this.pool.query('SELECT 1'); // handshake
    this.logger.log('pg Pool handshake OK');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('pg Pool closed');
  }
}

@Global()
@Module({
  providers: [
    PgPoolOwner,
    {
      provide: PG_POOL,
      useFactory: (owner: PgPoolOwner) => owner.pool,
      inject: [PgPoolOwner],
    },
  ],
  exports: [PG_POOL],
})
export class DbRawConfigModule {}
