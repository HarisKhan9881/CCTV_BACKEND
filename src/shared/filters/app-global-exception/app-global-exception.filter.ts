import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiResponseInterface } from '../../interfaces/api-response.interface';
import { AppConstants } from '../../classes/app-constant';

@Catch()
export class AppGlobalExceptionFilter implements ExceptionFilter {
  constructor(
      private readonly httpAdapterHost: HttpAdapterHost,
      @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let msg = AppConstants.SERVER_GENERAL_ERROR.toString();

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      msg = exception.message;
    }

    const body: ApiResponseInterface<any> = {
      STATUS_CODE: status,
      MESSAGE: msg,
      CONTENT: msg,
      SUCCESS: false,
    };


    this.logger.error('Unhandled exception', {
      url: request.url,
      method: request.method,
      statusCode: status,
      message: msg,
      stack: exception instanceof Error ? exception.stack : null,
    });

    this.httpAdapterHost.httpAdapter.reply(response, body, status);
  }
}
