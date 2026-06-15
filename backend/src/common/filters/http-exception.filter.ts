import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      // Log unexpected errors
      this.logger.error(exception, 'Unexpected error');
    }

    // Log the error for monitoring (we already logged unexpected errors above)
    // For expected errors, we can log at warn level
    if (!(exception instanceof HttpException) || status >= 500) {
      this.logger.error(exception, 'Error caught by HttpExceptionFilter');
    } else {
      this.logger.warn(
        `${message}`,
        `HTTP ${status} ${request.method} ${request.url}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string' ? message : (message as any).message || 'Error',
    });
  }
}