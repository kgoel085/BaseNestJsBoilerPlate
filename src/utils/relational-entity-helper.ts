import { instanceToPlain } from 'class-transformer';
import {
  AfterLoad,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class EntityRelationalHelper extends BaseEntity {
  __entity?: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  updated_at?: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deleted_at?: Date;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
