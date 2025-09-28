import {Injectable, Inject, Scope} from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Response } from 'express';
import { ApiResponseInterface } from '../interfaces/api-response.interface';
import { AppConstants, HTTPStatus } from '../classes/app-constant';

@Injectable({ scope: Scope.REQUEST })
export class ResponseHelper {
  constructor(
      @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  saveDataResponse(): string {
    return AppConstants.SAVED_SUCCESS_MESSAGE;
  }

  generalErrorResponse(error: unknown): string {
    this.logger.error('General error occurred', { error });
    return AppConstants.SERVER_GENERAL_ERROR;
  }

  SuccessReturn<T>(
      message: string,
      content: T | any,
      token?:string
  ): ApiResponseInterface<T> {
    const returnObject: ApiResponseInterface<T> = {
      MESSAGE: message,
      STATUS_CODE:HTTPStatus.OK,
      CONTENT: content,
      SUCCESS: true,
      TOKEN:token
    };

    this.logger.info(message, { content });
    return returnObject;
  }

  errorReturn<T>(
      message: string,
      exception: string,
      content?: any,
      statusCode: HTTPStatus = HTTPStatus.BAD_REQUEST,
  ): ApiResponseInterface<T> {
    const returnObject: ApiResponseInterface<T> = {
      MESSAGE: message,
      STATUS_CODE: statusCode,
      EXCEPTION: exception,
      CONTENT: content,
      SUCCESS: false,
    };

    this.logger.error(message, { exception, content });
    return returnObject;
  }

  serverErrorReturn<T>(
      httpResponse: Response,
      content: T,
      message: string = AppConstants.SERVER_GENERAL_ERROR,
      statusCode: HTTPStatus = HTTPStatus.BAD_REQUEST,
  ): Response<ApiResponseInterface<T>> {
    const returnObject: ApiResponseInterface<T> = {
      MESSAGE: message,
      STATUS_CODE: statusCode,
      CONTENT: content,
      SUCCESS: false,
    };

    this.logger.error(message, { content });
    return httpResponse.status(statusCode).json(returnObject);
  }
}
