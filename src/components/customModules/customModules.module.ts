// src/components/processColumns/processColumns.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomModulesService } from './customModules.service';
import { CustomModulesController } from './customModules.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'seuSegredoAqui',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [CustomModulesService, DatabaseService],
  controllers: [CustomModulesController],
})
export class CustomModulesModule {}
