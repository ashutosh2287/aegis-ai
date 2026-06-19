import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Stream } from 'stream';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is a stream (e.g., file download), don't wrap
        if (data instanceof Stream) {
          return data;
        }
        // If data is null or undefined, return null
        if (data === null || data === undefined) {
          return data;
        }
        // If data already has a statusCode (like from an exception that was caught and transformed?),
        // we assume it's already a formatted response and don't wrap.
        // But note: our exception filter returns a response directly, so it won't reach here.
        // We'll wrap everything else.
        return {
          success: true,
          timestamp: new Date().toISOString(),
          data,
          metadata: {},
        };
      }),
    );
  }
}