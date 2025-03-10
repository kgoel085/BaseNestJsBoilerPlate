import { BadRequestException, Logger, Module } from '@nestjs/common';
import { FilesS3Controller } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { FilesS3Service } from './files.service';
import { AllConfigType } from 'src/config/config.type';
import { memoryStorage } from 'multer';
import { RelationalFilePersistenceModule } from '../../persistence/relational/relational-persistence.module';

@Module({
  imports: [
    RelationalFilePersistenceModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return {
          preservePath: true,
          fileFilter: (request, file, callback) => {
            if (
              !file.originalname.match(
                /\.(jpg|jpeg|png|gif|tif|tiff|bmp|webp|pdf|docx|mp4|mpeg-2|mov|wmv|mkv)$/i,
              )
            ) {
              return callback(
                new BadRequestException(
                  `File type (${file.originalname.split('.').pop()?.toLocaleLowerCase()}) not supported !`,
                ),
                false,
              );
            }

            callback(null, true);
          },
          storage: memoryStorage(),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
  ],
  controllers: [FilesS3Controller],
  providers: [FilesS3Service, Logger],
  exports: [FilesS3Service],
})
export class FilesS3Module {}
