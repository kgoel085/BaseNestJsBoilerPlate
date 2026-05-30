import { UserEntity } from '../../../../../users/repositories/user/repository/user.entity';
import { Session } from '../../../../domain/session';
import { SessionEntity } from '../entities/session.entity';

export class SessionMapper {
  static toDomain(raw: SessionEntity): Session {
    const domainEntity = new Session();
    domainEntity.id = raw.id;
    if (raw.user) {
      const user = new UserEntity();
      user.id = raw.user.id;
      domainEntity.user = user;
    }
    domainEntity.hash = raw.hash;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Session): SessionEntity {
    const user = new UserEntity();
    user.id = domainEntity.user.id;

    const persistenceEntity = new SessionEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.hash = domainEntity.hash;
    persistenceEntity.user = user;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
