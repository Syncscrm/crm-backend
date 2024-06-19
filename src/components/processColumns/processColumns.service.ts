import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProcessColumnsService {
  constructor(private databaseService: DatabaseService) { }

  async listByCompany(empresaId: number): Promise<any[]> {
    const query = 'SELECT * FROM process_columns WHERE empresa_id = $1 ORDER BY display_order';
    const result = await this.databaseService.query(query, [empresaId]);
    return result;
  }

  async create(
    name: string,
    empresa_id: number,
    display_order: number,
    description?: string,
  ) {
    const query = 'INSERT INTO process_columns(name, empresa_id, display_order, description) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, empresa_id, display_order, description];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async update(id: number, name: string) {
    const query = 'UPDATE process_columns SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const values = [name, id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async delete(id: number) {
    const query = 'DELETE FROM process_columns WHERE id = $1';
    const result = await this.databaseService.query(query, [id]);
    return result;
  }
}
