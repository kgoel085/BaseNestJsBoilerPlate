import {
  // typeorm decorators here
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { Transform } from 'class-transformer';
import { FilesS3Service } from '../../../uploader/s3/files.service';

@Entity({ name: 'file' })
export class FileEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Transform(({ value }) => FilesS3Service.transformPthKeyToUrl(value), {
    toPlainOnly: true,
  })
  path: string;
}
