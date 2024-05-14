import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService, // Injetar o JwtService
  ) { }

  async addAfilhadoToUser(userId: number, afilhadoId: number): Promise<void> {
    const query = 'INSERT INTO user_afilhados (user_id, afilhado_id) VALUES ($1, $2)';
    await this.databaseService.query(query, [userId, afilhadoId]);
  }

  async removeAfilhadoFromUser(userId: number, afilhadoId: number): Promise<void> {
    const query = 'DELETE FROM user_afilhados WHERE user_id = $1 AND afilhado_id = $2';
    await this.databaseService.query(query, [userId, afilhadoId]);
  }

  async getUserAfilhados(userId: number): Promise<any[]> {
    const query = 'SELECT u.* FROM users u JOIN user_afilhados ua ON ua.afilhado_id = u.id WHERE ua.user_id = $1';
    const result = await this.databaseService.query(query, [userId]);
    return result;
  }

  async getUserColumns(userId: number): Promise<any[]> {
    const query = 'SELECT column_id FROM user_columns WHERE user_id = $1';
    const result = await this.databaseService.query(query, [userId]);
    return result.map(row => row.column_id);
  }

  async getUserColumnsInfo(userId: number): Promise<any[]> {
    const query = `
    SELECT pc.*
    FROM process_columns pc
    JOIN user_columns uc ON pc.id = uc.column_id
    WHERE uc.user_id = $1
    ORDER BY pc.display_order;
  `;
    const result = await this.databaseService.query(query, [userId]);
    return result;
  }

  async addColumnToUser(userId: number, columnId: number): Promise<void> {
    const query = 'INSERT INTO user_columns (user_id, column_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await this.databaseService.query(query, [userId, columnId]);
  }

  async removeColumnFromUser(userId: number, columnId: number): Promise<void> {
    const query = 'DELETE FROM user_columns WHERE user_id = $1 AND column_id = $2';
    await this.databaseService.query(query, [userId, columnId]);
  }

  async listByCompany(empresaId: number): Promise<any[]> {
    const query = `
      SELECT users.*, addresses.address, addresses.city, addresses.state, addresses.cep
      FROM users
      LEFT JOIN addresses ON users.id = addresses.user_id
      WHERE users.empresa_id = $1
      ORDER BY users.username;
    `;
    const result = await this.databaseService.query(query, [empresaId]);
    return result;
  }

  async create(
    userEmail: string, // E-mail do usuário administrador fazendo a requisição
    username: string,
    password: string,
    email: string, // E-mail do novo usuário
    address: string,
    city: string,
    state: string,
    cep: string,
    fone: string,
    avatar: string,
  ) {
    // Primeiro, determinar o empresa_id do administrador com base no userEmail
    const adminUserInfo = await this.findByEmail(userEmail);
    if (!adminUserInfo) {
      throw new Error('Usuário administrador não encontrado.');
    }
    const empresa_id = adminUserInfo.empresa_id; // Certifique-se de que esta coluna exista e esteja corretamente relacionada

    // Agora, proceda com a criação do novo usuário, incluindo o empresa_id
    const saltOrRounds = 10;
    //const hash = await bcrypt.hash(password, saltOrRounds);
    const hash = password;

    // Ajuste a query para inserir o usuário, incluindo o empresa_id
    const userQuery = 'INSERT INTO users(username, password, email, fone, empresa_id, avatar) VALUES($1, $2, $3, $4, $5, $6) RETURNING id';
    const userValues = [username, hash, email, fone, empresa_id, avatar]; // Inclua o avatar aqui
    const userResult = await this.databaseService.query(userQuery, userValues);
    const userId = userResult[0].id; // Supondo que id seja retornado

    // Inserindo o endereço usando o userId
    const addressQuery = 'INSERT INTO addresses(user_id, address, city, state, cep) VALUES($1, $2, $3, $4, $5)';
    const addressValues = [userId, address, city, state, cep];
    await this.databaseService.query(addressQuery, addressValues);

    return userResult[0];
  }

  async findByEmail(email: string): Promise<any> {
    const query = `
      SELECT u.*, a.address, a.city, a.state, a.cep
      FROM users u
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE u.email = $1;
    `;
    const result = await this.databaseService.query(query, [email]);
    return result[0];
  }


  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar a senha com bcrypt
    //const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = (password === user.password);

    if (!isMatch) {
      throw new Error('Senha inválida');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }


  async updateUser(
    userId: number,
    updates: {
      username?: string,
      fone?: string,
      avatar?: string,
      is_active?: boolean,
      meta_user?: number,
      meta_grupo?: number,
      entidade?: string,
      access_level?: number,
      // Adicionar novos campos de endereço
      address?: string,
      city?: string,
      state?: string,
      cep?: string
    }
  ): Promise<any> {
    const queryParts: string[] = [];
    const queryValues: any[] = [];

    // Atualização da tabela de usuários
    Object.entries(updates).forEach(([key, value], index) => {
      if (value !== undefined && ['username', 'fone', 'avatar', 'is_active', 'meta_user', 'meta_grupo', 'entidade', 'access_level'].includes(key)) {
        queryParts.push(`${key} = $${index + 1}`);
        queryValues.push(value);
      }
    });

    if (queryParts.length > 0) {
      const query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = $${queryParts.length + 1}`;
      queryValues.push(userId);
      await this.databaseService.query(query, queryValues);
    }

    // Atualização da tabela de endereços
    const addressParts: string[] = [];
    const addressValues: any[] = [];

    ['address', 'city', 'state', 'cep'].forEach((field, index) => {
      if (updates[field] !== undefined) {
        addressParts.push(`${field} = $${index + 1}`);
        addressValues.push(updates[field]);
      }
    });

    if (addressParts.length > 0) {
      addressValues.push(userId);
      const addressQuery = `UPDATE addresses SET ${addressParts.join(', ')} WHERE user_id = $${addressParts.length + 1}`;
      await this.databaseService.query(addressQuery, addressValues);
    }

    return { message: "Usuário e endereço atualizados com sucesso." };
  }


}
