import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProcessColumnsService {
  constructor(private databaseService: DatabaseService) { }
















  async getTop10PotentialSales(entityId: number): Promise<any[]> {
    const userQuery = `
      SELECT empresa_id, access_level 
      FROM users 
      WHERE id = $1;
    `;
    
    const userResult = await this.databaseService.query(userQuery, [entityId]);
    const { empresa_id, access_level } = userResult[0];

    const empresaIdNumber = parseInt(empresa_id, 10);

    //console.log("Parsed Empresa ID:", empresaIdNumber); 

    let baseQuery = `
      WITH history_count AS (
        SELECT card_history.card_id, count(*) AS num_histories
        FROM card_history
        GROUP BY card_history.card_id
      ), task_count AS (
        SELECT card_tasks.card_id, count(*) AS num_tasks
        FROM card_tasks
        GROUP BY card_tasks.card_id
      ), process_weights AS (
        SELECT process_columns.id,
          CASE
            WHEN lower(process_columns.name) LIKE '%orçamento%' THEN 0.2
            WHEN lower(process_columns.name) LIKE '%negociação%' THEN 0.5
            WHEN lower(process_columns.name) LIKE '%fechamento%' THEN 0.8
            ELSE 0.3
          END AS process_weight
        FROM process_columns
      ), origin_weights AS (
        SELECT DISTINCT o.name,
          CASE
            WHEN lower(o.name) LIKE '%parceiro%' OR lower(o.name) LIKE '%recomendação%' THEN 0.8
            ELSE 0.4
          END AS origin_weight
        FROM origens o
      )
      SELECT c.card_id, c.name AS card_name, c.cost_value, c.potencial_venda, 
             COALESCE(c.produto, 'Não informado') AS produto, 
             COALESCE(c.origem, 'Sem Origem') AS origem,
             h.num_histories, t.num_tasks,
             COALESCE(pw.process_weight, 0.3) AS process_weight,
             COALESCE(ow.origin_weight, 0.4) AS origin_weight,
             COALESCE(c.potencial_venda, 0) * 0.3 + 
             COALESCE(h.num_histories, 0) * 0.2 + 
             COALESCE(t.num_tasks, 0) * 0.2 + 
             COALESCE(pw.process_weight, 0.2) * 0.2 + 
             COALESCE(ow.origin_weight, 0.2) * 0.1 AS score,
             u.username AS responsavel,
             pc.name AS process_column_name
      FROM cards c
      LEFT JOIN history_count h ON c.card_id = h.card_id
      LEFT JOIN task_count t ON c.card_id = t.card_id
      LEFT JOIN process_weights pw ON c.column_id = pw.id
      LEFT JOIN origin_weights ow ON c.origem = ow.name
      LEFT JOIN users u ON c.entity_id = u.id
      LEFT JOIN process_columns pc ON c.column_id = pc.id
      WHERE c.status NOT IN ('Vendido', 'Perdido', 'Arquivado') 
        AND c.cost_value >= 100 
    `;

    if (access_level === 5) {
        baseQuery += `AND c.empresa_id = $1 `;
    } else {
        baseQuery += `AND c.empresa_id = $1 AND c.entity_id = $2 `;
    }

    baseQuery += `ORDER BY score DESC LIMIT 10;`;

    const params = [empresaIdNumber];
    if (access_level !== 5) {
        params.push(entityId);
    }

    const result = await this.databaseService.query(baseQuery, params);
    //console.log("Query Result:", result);

    return result;
}










  

  async getLatestStatus(): Promise<any> {
    const query = 'SELECT * FROM system_status ORDER BY updated_at DESC LIMIT 1';
    const result = await this.databaseService.query(query);
    return result[0];
  }

  

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
