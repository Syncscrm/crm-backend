import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  imports: [
    // Importe o JwtModule aqui
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'seuSegredoAqui', // Substitua 'seuSegredoAqui' por uma chave secreta real
      signOptions: { expiresIn: '60m' }, // Token expira em 60 minutos
    }),
  ],
  providers: [UsersService, DatabaseService], // Adicione o UsersService e DatabaseService aos providers
  controllers: [UsersController], // Adicione o UsersController aos controllers
})
export class UsersModule {}
