import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiResponseInterface } from '../../interfaces/api-response.interface';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Catch(HttpException)
export class LogExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(LogExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<ExpressResponse>();
    const request = ctx.getRequest();
    const msg = exception.message;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ApiResponseInterface<any> = {
      STATUS_CODE: status,
      MESSAGE: msg,
      CONTENT: msg,
      SUCCESS: false,
    };

    this.logger.error(`Error marks using endpoint:${request}`);
    this.logger.error(`Response marks using exception:${body}`);

    res.status(500).json(body);
  }
}
