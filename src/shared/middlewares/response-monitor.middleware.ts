import {Injectable, NestMiddleware, Inject, Scope} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable({ scope: Scope.REQUEST })
export class ResponseMonitorMiddleware implements NestMiddleware {
  constructor(
      @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const elapsed = Date.now() - startTime;
      const { method, originalUrl } = req;
      const { statusCode } = res;

      this.logger.info('Response monitor', {
        service: 'cctv_backend',
        method,
        url: originalUrl,
        statusCode,
        elapsedTimeMs: elapsed,
      });
    });

    next();
  }
}
