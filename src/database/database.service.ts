import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private pool: Pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'crm_db',
    password: 'Milt091547@',
    port: 5432,
  });

  async query(text: string, params?: any[]): Promise<any> {
    const res = await this.pool.query(text, params);
    return res.rows;
  }
}

