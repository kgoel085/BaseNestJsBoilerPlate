import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode =
      typeof exception?.getStatus === 'function'
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      typeof exception?.getResponse === 'function'
        ? exception.getResponse()
        : undefined;

    const reqErrStr = `${request.method} ${request.url}`;

    const errMsg =
      typeof exceptionResponse === 'object'
        ? exceptionResponse?.['message'] || exceptionResponse?.['error']
        : exceptionResponse || exception.message;

    // Ignore noisy unauthorized spam
    if (exception instanceof UnauthorizedException) {
      this.logger.warn(`[401] ${reqErrStr} :: ${errMsg}`);

      return response.status(statusCode).json({
        error: true,
        statusCode,
        message: errMsg,
      });
    }

    // Validation errors
    if ([400, 404, 422, 429].includes(statusCode)) {
      this.logger.warn(
        `[${statusCode}] ${reqErrStr} :: ${JSON.stringify(errMsg)}`,
      );

      return response.status(statusCode).json({
        error: true,
        statusCode,
        message: errMsg,
      });
    }

    // Production-safe error logging
    this.logger.error(
      `[${statusCode}] ${reqErrStr} :: ${errMsg}`,
      exception.stack?.split('\n').slice(0, 5).join('\n'),
    );

    return response.status(statusCode).json({
      error: true,
      statusCode,
      message: errMsg || 'Internal server error',
    });
  }
}
