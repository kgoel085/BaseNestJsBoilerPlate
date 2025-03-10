import {
  // common
  Module,
} from '@nestjs/common';

import { RelationalSessionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { SessionService } from './session.service';

// <database-block>
const infrastructurePersistenceModule = RelationalSessionPersistenceModule;
// </database-block>

@Module({
  imports: [infrastructurePersistenceModule],
  providers: [SessionService],
  exports: [SessionService, infrastructurePersistenceModule],
})
export class SessionModule {}
