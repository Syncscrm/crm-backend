// src/components/processColumns/processColumns.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProcessColumnsService } from './processColumns.service';
import { ProcessColumnsController } from './processColumns.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'seuSegredoAqui',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [ProcessColumnsService, DatabaseService],
  controllers: [ProcessColumnsController],
})
export class ProcessColumnsModule {}
