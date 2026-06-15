import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
export declare class TimeoutInterceptor implements NestInterceptor {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService, logger: Logger);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
