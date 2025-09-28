import {Injectable, NestMiddleware, Inject, Scope} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston'; // ✅ use Winston Logger, not Nest Logger

@Injectable({ scope: Scope.REQUEST })
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
      @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {

    const startTime = Date.now();

    const { method, originalUrl, body, query, params } = req;


    this.logger.info('Request started', {
      method,
      url: originalUrl,
      body,
      query,
      params,
    });

    res.on('finish', () => {
      const elapsedTime = Date.now() - startTime;
      this.logger.info('Request completed', {
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        elapsedTimeMs: elapsedTime,
      });
    });

    next();
  }
}
