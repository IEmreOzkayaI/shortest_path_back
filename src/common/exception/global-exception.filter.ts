import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ResponseDescription } from '../enum/custom-response.enums';
import { IDataResultResponse } from '../result/data-result.response';
import { Logger } from 'nestjs-pino';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.response?.status
      ? exception.response.status
      : exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception?.response?.data ||
      exception?.request?.data ||
      exception?.response?.message ||
      'Internal Server Error';

    this.logger.error(
      JSON.stringify(
        {
          errorMessage:
            exception?.response?.data ||
            exception?.request?.data ||
            exception?.response?.message ||
            'Internal Server Error',
          path: request.url,
          method: request.method,
          status: status,
          host: request.headers.host,
          stack: exception.stack,
          headers: {
            ...request.headers,
          },
        },
        null,
        2,
      ),
    );

    response.status(status).json({
      status: status,
      message: message || ResponseDescription.NOT_FOUND,
      data: null,
    } as IDataResultResponse<any>);
  }
}
