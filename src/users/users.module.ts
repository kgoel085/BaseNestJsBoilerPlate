import {
  // common
  Module,
} from '@nestjs/common';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { FilesModule } from '../files/files.module';
import { UserPersistenceModule } from './repositories';

@Module({
  imports: [UserPersistenceModule, FilesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UserPersistenceModule],
})
export class UsersModule {}
