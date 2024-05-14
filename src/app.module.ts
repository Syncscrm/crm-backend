import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './components/users/users.module';
import { ProcessColumnsModule } from './components/processColumns/processColumns.module';
import { CardModule } from './components/card/card.module';

@Module({
  imports: [UsersModule, ProcessColumnsModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



