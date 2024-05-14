// src/components/processColumns/processColumns.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProcessColumnsService {
  constructor(private databaseService: DatabaseService) { }

  async listByCompany(empresaId: number): Promise<any[]> {
    //console.log('Service Processos - buscar', empresaId);
    const query = 'SELECT * FROM process_columns WHERE empresa_id = $1 ORDER BY display_order';
    const result = await this.databaseService.query(query, [empresaId]);
    //console.log(result);
    return result; // Retorna todas as linhas (todos os registros encontrados)
  }

  async create(
    name: string,
    empresa_id: number,
    display_order: number,
    description?: string,
  ) {
    //console.log('Service Processos', name, empresa_id, display_order, description)

    const query = 'INSERT INTO process_columns(name, empresa_id, display_order, description) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, empresa_id, display_order, description];
    const result = await this.databaseService.query(query, values);
    return result[0]; // Assumindo que a query retorna o objeto criado
  }

  // Adicione mais métodos conforme necessário para listar, atualizar, deletar, etc.
}
