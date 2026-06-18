import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError, TimeoutError as RxJSTimeoutError } from "rxjs";
import { timeout, catchError } from "rxjs/operators";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutSeconds =
      this.configService.get<number>("requestTimeout") || 30;
    const timeoutMilliseconds = timeoutSeconds * 1000;

    return next.handle().pipe(
      timeout(timeoutMilliseconds),
      catchError((err) => {
        if (err instanceof RxJSTimeoutError) {
          this.logger.warn(
            `Request timeout after ${timeoutSeconds} seconds`,
            `Timeout on ${context.getType()}`,
          );
          return throwError(() => new Error("Request timeout"));
        }
        return throwError(() => err);
      }),
    );
  }
}
