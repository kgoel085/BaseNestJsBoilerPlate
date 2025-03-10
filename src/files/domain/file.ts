import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Transform } from 'class-transformer';
import { FilesS3Service } from '../infrastructure/uploader/s3/files.service';

export class FileType {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @Allow()
  id: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform(({ value }) => FilesS3Service.transformPthKeyToUrl(value), {
    toPlainOnly: true,
  })
  path: string;
}
