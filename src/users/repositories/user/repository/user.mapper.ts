import { User } from '../domain/user';
import { UserEntity } from './user.entity';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.provider = raw.provider;
    domainEntity.first_name = raw.first_name;
    domainEntity.last_name = raw.last_name;
    if (raw.photo) {
      domainEntity.photo = raw.photo;
    }
    domainEntity.role = raw.role;
    domainEntity.created_at = raw.created_at;
    domainEntity.updated_at = raw.updated_at;
    domainEntity.deleted_at = raw.deleted_at;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.provider = domainEntity.provider;
    persistenceEntity.first_name = domainEntity.first_name;
    persistenceEntity.last_name = domainEntity.last_name;
    persistenceEntity.photo = domainEntity.photo;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.created_at = domainEntity.created_at;
    persistenceEntity.updated_at = domainEntity.updated_at;
    persistenceEntity.deleted_at = domainEntity.deleted_at;
    return persistenceEntity;
  }
}
