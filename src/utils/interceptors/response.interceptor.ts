import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { decrypt, encrypt } from '../crypto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

export class CommonResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Success',
  })
  message: string;

  @ApiProperty({
    example: false,
  })
  error: boolean;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly secretKey: string;
  private enableEncryption = false;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.secretKey =
      this.configService.get<string>('app.dataEncryptKey', {
        infer: true,
      }) ?? '';

    this.enableEncryption =
      this.configService.get<boolean>('app.enableEncryption', {
        infer: true,
      }) ?? false;
  }

  private handleData(bodyPayload: any) {
    if (bodyPayload && Object.keys(bodyPayload).length === 1) {
      if (bodyPayload?.data && typeof bodyPayload?.data === 'string') {
        bodyPayload = decrypt(bodyPayload?.data, this.secretKey);
      } else {
        throw new BadRequestException('Invalid request payload !');
      }
    }

    return bodyPayload;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    if (this.secretKey && this.enableEncryption) {
      // Handle decryption of request body and query params
      const request = context.switchToHttp().getRequest();

      request.body = this.handleData(request.body);
      request.query = this.handleData(request.query);
    }

    return next.handle().pipe(
      map((data: any) => {
        const returnData =
          data && data?.sendRaw
            ? (data?.data ?? {})
            : {
                data: data
                  ? this.secretKey && this.enableEncryption // handle encryption of response data
                    ? encrypt(JSON.stringify(data), this.secretKey)
                    : data
                  : {},
                statusCode:
                  context.switchToHttp().getResponse().statusCode ??
                  HttpStatus.OK,
                message: 'Success',
                error: false,
              };
        return returnData;
      }),
    );
  }
}
