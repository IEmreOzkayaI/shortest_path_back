import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDescription } from './enum/custom-response.enums';
import { IDataResultResponse } from './result/data-result.response';

@Injectable()
export class GlobalResponseInterceptor<T>
  implements NestInterceptor<T, IDataResultResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IDataResultResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        const status = result.status || HttpStatus.OK;
        const responseDescription = result.message || ResponseDescription.OK;
        const data = result.data ? result.data : result;

        return {
          status: status,
          message: responseDescription,
          data: data,
        } as IDataResultResponse<T>;
      }),
    );
  }
}
