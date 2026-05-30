import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { AuthProvidersEnum } from '../../../../auth/auth-providers.enum';
import { EntityRelationalHelper } from '../../../../utils/relational-entity-helper';
import { RoleEnum } from '../../../../roles/roles.enum';
import { User } from '../domain/user';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ type: String, nullable: false })
  first_name: string;

  @Index()
  @Column({ type: String, nullable: false })
  last_name: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  photo?: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.User,
  })
  role: RoleEnum;
}
