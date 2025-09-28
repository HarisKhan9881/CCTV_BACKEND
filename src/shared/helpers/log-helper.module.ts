import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'info',
      defaultMeta: { service: 'cctv_backend' },
      format: winston.format.combine(
          winston.format.timestamp({ format: () => new Date().toISOString() }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
          winston.format.json(), // used for file logs
      ),
      transports: [
        // Console
        new winston.transports.Console({
          format: isProd
              ? winston.format.json()
              : winston.format.combine(
                  winston.format.colorize(),
                  winston.format.printf(
                      ({ timestamp, level, message, context, stack, ...meta }) => {
                        const metaStr = Object.keys(meta).length
                            ? JSON.stringify(meta)
                            : '';
                        return `${timestamp} [${context || 'App'}] ${level}: ${message} ${stack || ''} ${metaStr}`;
                      },
                  ),
              ),
        }),

        // Application logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d',
          zippedArchive: true,
          level: 'info',
        }),

        // Error logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          zippedArchive: true,
          level: 'error',
        }),
      ],

      // Exception handling
      exceptionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ],

      // Promise rejections
      rejectionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ],

      exitOnError: false,
    }),
  ],
  exports: [WinstonModule]
})
export class LoggerModule {}
