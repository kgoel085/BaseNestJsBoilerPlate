import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger();
  }
  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const exceptionResponse =
      typeof exception?.getResponse === 'function'
        ? exception?.getResponse()
        : undefined;

    const statusCode =
      typeof exception?.getStatus === 'function'
        ? exception?.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.debug(
      {
        stack: exception.stack,
        exception,
        req: request?.body,
        headers: JSON.stringify(request?.rawHeaders ?? ''),
      },
      'Exception Error Stack:: ',
    );
    const reqErrStr = `request method: ${request.method} request url: ${request.url}`;
    if (
      [400, 422, 404, 429].includes(statusCode) &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const validationErrors = (exceptionResponse as any).message;

      this.logger.error(reqErrStr, validationErrors);
      return response.status(statusCode).json({
        error: true,
        statusCode,
        message: validationErrors,
      });
    }

    const errMsg = exceptionResponse
      ? exceptionResponse['error'] ||
        exceptionResponse['message'] ||
        exceptionResponse
      : 'Invalid request !';
    this.logger.error(reqErrStr, errMsg);
    return response.status(statusCode).json({
      statusCode,
      error: true,
      message: errMsg,
    });
  }
}
