import { TypeOrmModuleOptions } from '@nestjs/typeorm';


export function getTypeOrmConfig(): TypeOrmModuleOptions {
  const ssl =
    (process.env.DB_SSL ?? 'false').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : false;


  return {
    type: 'postgres',
    host: String(process.env.DB_HOST ?? 'localhost'),
    port: parseInt(String(process.env.DB_PORT ?? '5432'), 10),
    database: String(process.env.DB_NAME??''),
    username:String( process.env.DB_USER??''),
    password:String(process.env.DB_PASS ?? ''),
    ssl,
    autoLoadEntities: true,
    synchronize: false,
    logging: ['error', 'warn'],
  };


}
