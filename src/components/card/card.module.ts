// src/components/processColumns/processColumns.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'seuSegredoAqui',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [CardService, DatabaseService],
  controllers: [CardController],
})
export class CardModule {}
