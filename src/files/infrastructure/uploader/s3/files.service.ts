import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileRepository } from '../../persistence/file.repository';
import { FileType } from '../../../domain/file';
import { FileConfig, FileDriver } from '../../../config/file-config.type';
import fileConfig from '../../../config/file.config';
import { AppConfig } from '../../../../config/app-config.type';
import appConfig from '../../../../config/app.config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileDriverS3ClientConfig } from './config';

@Injectable()
export class FilesS3Service {
  constructor(private readonly fileRepository: FileRepository) {}

  static async transformPthKeyToUrl(value: string) {
    const fileConfigObj = fileConfig() as FileConfig;
    if (fileConfigObj.driver === FileDriver.LOCAL) {
      return (appConfig() as AppConfig).backendDomain + value;
    } else if (
      [FileDriver.S3_PRESIGNED, FileDriver.S3].includes(fileConfigObj.driver)
    ) {
      const s3 = new S3Client(fileDriverS3ClientConfig());

      const bucketName = fileConfigObj.awsDefaultS3Bucket ?? '';
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: value,
      });

      let url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      if (
        fileConfigObj?.awsDefaultS3Url &&
        fileConfigObj.awsDefaultS3Url.length
      ) {
        const protocol = url.split('://')[0];

        url = url.replace(
          `${protocol}://s3.${fileConfigObj.awsS3Region}.amazonaws.com/${bucketName}`,
          fileConfigObj.awsDefaultS3Url,
        );

        url = url.replace(
          `${protocol}://${bucketName}.s3.${fileConfigObj.awsS3Region}.amazonaws.com`,
          fileConfigObj.awsDefaultS3Url,
        );
      }

      return url;
    }

    return value;
  }

  async create(file: Express.MulterS3.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    return {
      file: await this.fileRepository.create({
        path: file.key,
      }),
    };
  }
}
