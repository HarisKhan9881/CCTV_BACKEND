import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { NullValueException } from './null-value-exception';
import { ApiResponseInterface } from '../../interfaces/api-response.interface';
import { AppConstants, HTTPStatus } from '../../classes/app-constant';
import type { Request, Response as ExpressResponse } from 'express';

@Catch(NullValueException)
export class NullValueFilter<T> implements ExceptionFilter {

  catch(exception:NullValueException, host: ArgumentsHost) {


    const status: number = HTTPStatus.BAD_GATEWAY;

    const content = (((exception as any)?.content ?? null) as unknown) as T;

    const body:ApiResponseInterface<T>={
      MESSAGE:exception.message ?? AppConstants.SERVER_GENERAL_ERROR,
      SUCCESS:false,
      CONTENT: content,
      STATUS_CODE:status
    };

    const ctx =host.switchToHttp();
    const res=ctx.getResponse();

    res.status(HttpStatus.BAD_REQUEST).json(body);
  }
}
