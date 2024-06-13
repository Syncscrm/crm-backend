// src/components/processColumns/processColumns.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

import axios from 'axios';

import { ref, deleteObject } from "firebase/storage";

import { storage } from '../../config/firebase'


@Injectable()
export class CardService {
  constructor(private databaseService: DatabaseService) { }





  /// ----------------- anexos


  async getAnexosByCardId(cardId: number) {
    const query = `
      SELECT * FROM anexos
      WHERE card_id = $1;
    `;
    const values = [cardId];
    const result = await this.databaseService.query(query, values);
    return result;  // Retorna todos os anexos do card
  }

  async addAnexo(cardId: number, empresaId: number, url: string, nomeArquivo: string, tamanho: number, tipoArquivo: string) {
    const query = `
      INSERT INTO anexos (card_id, empresa_id, url, nome_arquivo, tamanho, tipo_arquivo, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [cardId, empresaId, url, nomeArquivo, tamanho, tipoArquivo];
    const result = await this.databaseService.query(query, values);
    console.log("Anexo adicionado:", result);
    return result[0];  // Retorna o anexo adicionado
  }

  async deleteAnexo(anexoId: number) {
    const query = `
      DELETE FROM anexos
      WHERE id = $1
      RETURNING *;
    `;
    const values = [anexoId];
    const result = await this.databaseService.query(query, values);
    console.log("Resultado da exclusão do anexo:", result);
    return result[0];  // Retorna o anexo excluído
  }

  async getAnexoByUrl(url: string) {
    const query = `
      SELECT * FROM anexos
      WHERE url = $1;
    `;
    const values = [url];
    const result = await this.databaseService.query(query, values);
    console.log("Anexo encontrado:", result);
    return result[0];  // Retorna o anexo encontrado
  }




























  async deleteAllAnexosByCardId(cardId: number) {
    const query = `
      DELETE FROM anexos
      WHERE card_id = $1
      RETURNING *;
    `;
    const values = [cardId];
    const result = await this.databaseService.query(query, values);

    for (const anexo of result) {
      const storageRef = ref(storage, `syncs/empresa-id-${anexo.empresa_id}/${anexo.nome_arquivo}`);
      await deleteObject(storageRef);
    }

    return result;
  }



  // async deleteCard(cardId: number) {
  //   await this.databaseService.query('BEGIN');
  //   try {
  //     await this.deleteCardHistory(cardId);
  //     await this.deleteCardTasks(cardId);
  //     await this.deleteCardShareds(cardId);
  //     await this.deleteModuloEsquadrias(cardId);

  //     const deleteQuery = `DELETE FROM cards WHERE card_id = $1 RETURNING *;`;
  //     const result = await this.databaseService.query(deleteQuery, [cardId]);

  //     if (result.length === 0) {
  //       throw new Error('Nenhum card encontrado para o card_id fornecido.');
  //     }

  //     await this.databaseService.query('COMMIT');
  //     return result; // Retorna o card excluído
  //   } catch (error) {
  //     await this.databaseService.query('ROLLBACK');
  //     throw new Error('Erro ao excluir o card e seus registros relacionados: ' + error.message);
  //   }
  // }


  async deleteCard(cardId: number) {
    await this.databaseService.query('BEGIN');
    try {
      await this.deleteAllAnexosByCardId(cardId);
      await this.deleteCardHistory(cardId);
      await this.deleteCardTasks(cardId);
      await this.deleteCardShareds(cardId);
      await this.deleteModuloEsquadrias(cardId);

      const deleteQuery = `DELETE FROM cards WHERE card_id = $1 RETURNING *;`;
      const result = await this.databaseService.query(deleteQuery, [cardId]);
      if (result.length === 0) {
        throw new Error('Nenhum card encontrado para o card_id fornecido.');
      }
      await this.databaseService.query('COMMIT');
      return result;
    } catch (error) {
      await this.databaseService.query('ROLLBACK');
      throw new Error('Erro ao excluir o card e seus registros relacionados: ' + error.message);
    }
  }


  // Método para excluir registros em card_history pelo card_id
  async deleteCardHistory(cardId: number) {
    const deleteQuery = `DELETE FROM card_history WHERE card_id = $1 RETURNING *;`;
    const result = await this.databaseService.query(deleteQuery, [cardId]);
    // if (result.length === 0) {
    //   throw new Error('Nenhum histórico encontrado para o card_id fornecido.');
    // }
    return result; // Retorna os registros excluídos
  }

  // Método para excluir registros em card_tasks pelo card_id
  async deleteCardTasks(cardId: number) {
    const deleteQuery = `DELETE FROM card_tasks WHERE card_id = $1 RETURNING *;`;
    const result = await this.databaseService.query(deleteQuery, [cardId]);
    // if (result.length === 0) {
    //   throw new Error('Nenhuma tarefa encontrada para o card_id fornecido.');
    // }
    return result; // Retorna os registros excluídos
  }

  // Método para excluir registros em card_shareds pelo card_id
  async deleteCardShareds(cardId: number) {
    const deleteQuery = `DELETE FROM card_shareds WHERE card_id = $1 RETURNING *;`;
    const result = await this.databaseService.query(deleteQuery, [cardId]);
    // if (result.length === 0) {
    //   throw new Error('Nenhum compartilhamento encontrado para o card_id fornecido.');
    // }
    return result; // Retorna os registros excluídos
  }

  // Método para excluir registros em modulo_esquadrias pelo card_id
  async deleteModuloEsquadrias(cardId: number) {
    const deleteQuery = `DELETE FROM modulo_esquadrias WHERE card_id = $1 RETURNING *;`;
    const result = await this.databaseService.query(deleteQuery, [cardId]);
    // if (result.length === 0) {
    //   throw new Error('Nenhum módulo de esquadrias encontrado para o card_id fornecido.');
    // }
    return result; // Retorna os registros excluídos
  }































  async enviarMensagemParaBotConversa(numero: string, contato: string, mensagem: string): Promise<void> {
    const urlWebhook = 'https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/31401/RZPmGB3NnLLL/';

    console.log('service', numero, contato, mensagem)

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return new Promise<void>((resolve, reject) => {
      const req = axios.post(urlWebhook, { numero, contato, mensagem }, options);

      req.then(() => {
        resolve();
      }).catch(error => {
        console.error('Erro ao enviar mensagem para o BotConversa:', error.message);
        reject(new Error('Falha ao enviar mensagem para o BotConversa.'));
      });
    });
  }








  async updateBlockColumn(id: number, block_column: boolean) {
    const query = `
      UPDATE cards
      SET block_column = $2, updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $1
      RETURNING *;
    `;
    const values = [id, block_column];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0];  // Retorna a linha atualizada
    } catch (error) {
      throw new Error('Erro ao atualizar bloquio de coluna');
    }
  }





  // Método para atualizar o column_id de um card
  async updateCardEtiqueta(cardId: number, etiqueta_id: number): Promise<any> {
    const query = `
    UPDATE cards
    SET etiqueta_id = $2
    WHERE card_id = $1
    RETURNING *;
  `;
    const values = [cardId, etiqueta_id];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0]; // Assume que a atualização retorna o card atualizado
    } catch (error) {
      throw new Error('Erro ao atualizar o etiqueta do card: ' + error.message);
    }
  }


  async buscarEtiquetas(empresa_id: number) {
    const query = `
      SELECT * FROM etiquetas WHERE empresa_id = $1;
    `;

    const values = [empresa_id];
    return await this.databaseService.query(query, values);
  }





  async findSoldLastMinute(empresa_id: number) {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const query = `
      SELECT card_id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status, origem, produto, status_date
      FROM cards
      WHERE status = 'Vendido' AND status_date >= $1
      AND empresa_id = $2;
    `;

    const values = [oneMinuteAgo, empresa_id];
    return await this.databaseService.query(query, values);
  }


  async bucarCor(empresa_id: number) {
    const query = `
      SELECT * FROM cores WHERE empresa_id = $1;
    `;

    const values = [empresa_id];
    return await this.databaseService.query(query, values);
  }

  async bucarProdutos(empresa_id: number) {
    const query = `
      SELECT * FROM produtos WHERE empresa_id = $1;
    `;

    const values = [empresa_id];
    return await this.databaseService.query(query, values);
  }

  async bucarOrigens(empresa_id: number) {
    const query = `
      SELECT * FROM origens WHERE empresa_id = $1;
    `;

    const values = [empresa_id];
    return await this.databaseService.query(query, values);
  }




  // No serviço (service)
  async markMessagesAsRead(userId: number, destinatarioId: number): Promise<void> {
    const query = `
    UPDATE messages
    SET read = true
    WHERE id_destinatario = $1 AND id_remetente = $2 AND read = false;
  `;
    const values = [userId, destinatarioId];
    await this.databaseService.query(query, values);
  }

  // No serviço (service)
  async getUnreadMessagesCount(userId: number, senderId: number): Promise<number> {
    const query = `
    SELECT COUNT(*) FROM messages
    WHERE id_destinatario = $1 AND id_remetente = $2 AND read = false;
  `;
    const values = [userId, senderId];
    const result = await this.databaseService.query(query, values);
    return parseInt(result[0].count, 10);
  }

  // No serviço (service)
  async getTotalUnreadMessagesCount(userId: number): Promise<number> {
    const query = `
    SELECT COUNT(*) FROM messages
    WHERE id_destinatario = $1 AND read = false;
  `;
    const values = [userId];
    const result = await this.databaseService.query(query, values);
    return parseInt(result[0].count, 10);
  }



  async searchCardById(cardId: number, entityId: number, empresaId: number) {

    console.log('cardId - service', cardId)
    const query = `
      SELECT c.*, me.nome_obra FROM cards c
      LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
      WHERE c.card_id = $1 AND c.entity_id = $2 AND c.empresa_id = $3
  
      UNION
  
      SELECT c.*, me.nome_obra FROM cards c
      LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
      INNER JOIN user_afilhados ua ON ua.afilhado_id = c.entity_id
      WHERE c.card_id = $1 AND ua.user_id = $2 AND c.empresa_id = $3
  
      UNION
  
      SELECT c.*, me.nome_obra FROM cards c
      LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
      INNER JOIN card_shareds cs ON cs.card_id = c.card_id
      WHERE c.card_id = $1 AND cs.shared_user_id = $2 AND c.empresa_id = $3;
    `;
    const values = [cardId, entityId, empresaId];
    return await this.databaseService.query(query, values);
  }



  async getMessages(userId: number, destinatarioId: number) {
    const query = `
      SELECT * FROM messages
      WHERE (id_remetente = $1 AND id_destinatario = $2) 
         OR (id_remetente = $2 AND id_destinatario = $1)
      ORDER BY created_at ASC;
    `;
    const values = [userId, destinatarioId];
    const result = await this.databaseService.query(query, values);
    return result;
  }


  async addMessage(id_remetente: number, id_destinatario: number, message: string, read: boolean) {
    try {
      // Inicia uma transação
      await this.databaseService.query('BEGIN');

      // Insere a mensagem na tabela de mensagens
      const insertMessageQuery = `
        INSERT INTO messages(id_remetente, id_destinatario, message, created_at, read)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        RETURNING *;
      `;
      const messageValues = [id_remetente, id_destinatario, message, read];
      const messageResult = await this.databaseService.query(insertMessageQuery, messageValues);

      // Finaliza a transação com sucesso
      await this.databaseService.query('COMMIT');

      return messageResult[0]; // Retorna a mensagem adicionada
    } catch (error) {
      // Reverte todas as operações se ocorrer algum erro
      await this.databaseService.query('ROLLBACK');
      throw new Error('Erro ao adicionar mensagem: ' + error.message);
    }
  }





  // async findCardsPCP(entity_id: number, empresa_id: number) {
  //   const query = `
  //     -- Consulta atualizada para incluir todas as informações de modulo_esquadrias para cartões do usuário e seus afilhados
  //     WITH CombinedCards AS (
  //       SELECT c.*, me.*
  //       FROM cards c
  //       LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
  //       WHERE c.entity_id = $1 AND c.empresa_id = $2

  //       UNION

  //       SELECT c.*, me.*
  //       FROM cards c
  //       INNER JOIN user_afilhados ua ON ua.afilhado_id = c.entity_id
  //       LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
  //       WHERE ua.user_id = $1 AND c.empresa_id = $2
  //     )
  //     SELECT * FROM CombinedCards;
  //   `;

  //   const values = [entity_id, empresa_id];
  //   return await this.databaseService.query(query, values);
  // }


  async findCardsPCP(entity_id: number, empresa_id: number) {
    const query = `
      -- Consulta atualizada para incluir todas as informações de modulo_esquadrias para cartões do usuário e seus afilhados, filtrando por status 'Vendido'
      WITH CombinedCards AS (
        SELECT c.*, me.*
        FROM cards c
        LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
        WHERE c.entity_id = $1 AND c.empresa_id = $2 AND c.status = 'Vendido'
  
        UNION
  
        SELECT c.*, me.*
        FROM cards c
        INNER JOIN user_afilhados ua ON ua.afilhado_id = c.entity_id
        LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
        WHERE ua.user_id = $1 AND c.empresa_id = $2 AND c.status = 'Vendido'
      )
      SELECT * FROM CombinedCards;
    `;

    const values = [entity_id, empresa_id];
    return await this.databaseService.query(query, values);
  }




  async novoParticipante(
    name: string,
    email: string,
    telefone: string,
    endereco: string,
    tipo: string,
    state: string,
    city: string
  ) {
    const query = `INSERT INTO participantes(name, email, telefone, endereco, tipo, state, city)
                   VALUES($1, $2, $3, $4, $5, $6, $7)
                   RETURNING *`;
    const values = [name, email, telefone, endereco, tipo, state, city];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }



  async addCardHistoryImportSuiteFlow(card_id: number, user_id: number, action_type: string, description: string, card_status: string, create_at: string, empresa_id: number) {
    try {
      // Inicia uma transação
      await this.databaseService.query('BEGIN');

      // Insere o registro no histórico
      const insertHistoryQuery = `
      INSERT INTO card_history(card_id, user_id, action_type, description, card_status, create_at, empresa_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
      const historyValues = [card_id, user_id, action_type, description, card_status, create_at, empresa_id];
      const historyResult = await this.databaseService.query(insertHistoryQuery, historyValues);

      // Finaliza a transação com sucesso
      await this.databaseService.query('COMMIT');

      return historyResult[0]; // Retorna o histórico adicionado
    } catch (error) {
      // Reverte todas as operações se ocorrer algum erro
      await this.databaseService.query('ROLLBACK');
      throw new Error('Erro ao adicionar histórico: ' + error.message);
    }
  }



  async importSuiteFlow(
    created_at: string,
    name: string,
    column_id: number,
    entity_id: number,
    empresa_id: number,
    document_number: string,
    cost_value: number,
    origem: string,
    produto: string,
    motivo_venda_perdida: string,
    nivel_prioridade: number,
    sale_value: number,
    potencial_venda: number,
    status: string,
    status_date: string,
    updated_at: string,
    email: string,
    fone: string,
    state: string,
    city: string,
    pedido_number: string,
    etapa_producao: number,
    etiqueta_id: number,
  ) {
    const query = `INSERT INTO cards(created_at, name, column_id, entity_id, empresa_id, document_number, cost_value, origem, produto, motivo_venda_perdida, nivel_prioridade, sale_value, potencial_venda, status, status_date, updated_at, email, fone, state, city, pedido_number, etapa_producao, etiqueta_id)
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                 RETURNING *`;
    const values = [created_at, name, column_id, entity_id, empresa_id, document_number, cost_value, origem, produto, motivo_venda_perdida, nivel_prioridade, sale_value, potencial_venda, status, status_date, updated_at, email, fone, state, city, pedido_number, etapa_producao, etiqueta_id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }



  async import(
    name: string,
    state: string,
    city: string,
    fone: string,
    email: string,
    column_id: number,
    entity_id: number,
    empresa_id: number,
    document_number: string,
    cost_value: number,
  ) {
    const status = ''; // Definindo status como uma string vazia
    // Incluindo potencial_venda e definindo seu valor padrão como 2
    const query = 'INSERT INTO cards(name, state, city, fone, email, column_id, entity_id, empresa_id, status, document_number, cost_value, potencial_venda) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
    const values = [name, state, city, fone, email, column_id, entity_id, empresa_id, status, document_number, cost_value, 2]; // Adicionando 2 como valor de potencial_venda
    const result = await this.databaseService.query(query, values);
    return result[0];
  }




  // Método para atualizar o column_id de um card
  async updateCardColumn(cardId: number, columnId: number): Promise<any> {
    const query = `
    UPDATE cards
    SET column_id = $2, updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1
    RETURNING *;
  `;
    const values = [cardId, columnId];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0]; // Assume que a atualização retorna o card atualizado
    } catch (error) {
      throw new Error('Erro ao atualizar o column_id do card: ' + error.message);
    }
  }



  // MODULO DE ESQUADRIAS
  async getEsquadrias(cardId: number) {
    const query = `
    SELECT * FROM modulo_esquadrias WHERE card_id = $1;
  `;
    const values = [cardId];
    return await this.databaseService.query(query, values);
  }

  async upsertEsquadria(esquadriaData) {
    //console.log('modulo esquadrias service');
    const upsertQuery = `
      INSERT INTO modulo_esquadrias (
        card_id, nome_obra, contato_obra, previsao_medicao, status_medicao,
        previsao_producao, status_producao, previsao_entrega_vidro, status_entrega_vidro,
        previsao_vistoria_pre, status_vistoria_pre, previsao_entrega_obra, status_entrega_obra,
        previsao_instalacao, status_instalacao, previsao_vistoria_pos, status_vistoria_pos,
        previsao_assistencia, status_assistencia, horas_producao, quantidade_esquadrias,
        quantidade_quadros, metros_quadrados, cor, obs, empresa_id, prazo_entrega, status_prazo_entrega
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      )
      ON CONFLICT (card_id) DO UPDATE SET
        nome_obra = EXCLUDED.nome_obra,
        contato_obra = EXCLUDED.contato_obra,
        previsao_medicao = EXCLUDED.previsao_medicao,
        status_medicao = EXCLUDED.status_medicao,
        previsao_producao = EXCLUDED.previsao_producao,
        status_producao = EXCLUDED.status_producao,
        previsao_entrega_vidro = EXCLUDED.previsao_entrega_vidro,
        status_entrega_vidro = EXCLUDED.status_entrega_vidro,
        previsao_vistoria_pre = EXCLUDED.previsao_vistoria_pre,
        status_vistoria_pre = EXCLUDED.status_vistoria_pre,
        previsao_entrega_obra = EXCLUDED.previsao_entrega_obra,
        status_entrega_obra = EXCLUDED.status_entrega_obra,
        previsao_instalacao = EXCLUDED.previsao_instalacao,
        status_instalacao = EXCLUDED.status_instalacao,
        previsao_vistoria_pos = EXCLUDED.previsao_vistoria_pos,
        status_vistoria_pos = EXCLUDED.status_vistoria_pos,
        previsao_assistencia = EXCLUDED.previsao_assistencia,
        status_assistencia = EXCLUDED.status_assistencia,
        horas_producao = EXCLUDED.horas_producao,
        quantidade_esquadrias = EXCLUDED.quantidade_esquadrias,
        quantidade_quadros = EXCLUDED.quantidade_quadros,
        metros_quadrados = EXCLUDED.metros_quadrados,
        cor = EXCLUDED.cor,
        obs = EXCLUDED.obs,
        empresa_id = EXCLUDED.empresa_id,
        prazo_entrega = EXCLUDED.prazo_entrega, 
        status_prazo_entrega = EXCLUDED.status_prazo_entrega
      RETURNING *;
    `;
    const values = [
      esquadriaData.card_id, esquadriaData.nome_obra, esquadriaData.contato_obra, esquadriaData.previsao_medicao, esquadriaData.status_medicao,
      esquadriaData.previsao_producao, esquadriaData.status_producao, esquadriaData.previsao_entrega_vidro, esquadriaData.status_entrega_vidro,
      esquadriaData.previsao_vistoria_pre, esquadriaData.status_vistoria_pre, esquadriaData.previsao_entrega_obra, esquadriaData.status_entrega_obra,
      esquadriaData.previsao_instalacao, esquadriaData.status_instalacao, esquadriaData.previsao_vistoria_pos, esquadriaData.status_vistoria_pos,
      esquadriaData.previsao_assistencia, esquadriaData.status_assistencia, esquadriaData.horas_producao, esquadriaData.quantidade_esquadrias,
      esquadriaData.quantidade_quadros, esquadriaData.metros_quadrados, esquadriaData.cor, esquadriaData.obs, esquadriaData.empresa_id,
      esquadriaData.prazo_entrega, esquadriaData.status_prazo_entrega
    ];
    return await this.databaseService.query(upsertQuery, values);
  }


  async updateCardStatus(id: number, status: string, columnId: number | null) {
    const query = `
      UPDATE cards
      SET status = $2, column_id = COALESCE($3, column_id), status_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $1
      RETURNING *;
    `;
    const values = [id, status, columnId];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0];
    } catch (error) {
      throw new Error('Erro ao atualizar o status do card: ' + error.message);
    }
  }


  async updateCardStatusVendaPerdida(id: number, status: string, motivo: string, columnId: number) {
    const query = `
      UPDATE cards
      SET status = $2, motivo_venda_perdida = $3, column_id = $4, status_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $1
      RETURNING *;
    `;
    const values = [id, status, motivo, columnId];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0];
    } catch (error) {
      throw new Error('Erro ao atualizar o status do card: ' + error.message);
    }
  }




  async updateCardArquivado(id: number, status: string, columnId: number) {
    const query = `
      UPDATE cards
      SET status = $2, column_id = $3, status_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $1
      RETURNING *;
    `;
    const values = [id, status, columnId];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0];
    } catch (error) {
      throw new Error('Erro ao atualizar o status do card: ' + error.message);
    }
  }





  async createBulkCards(cards: any[]) {
    try {
      // Começa uma transação para inserir todos os cards de uma vez
      await this.databaseService.query('BEGIN');
      for (const card of cards) {
        const insertQuery = `
          INSERT INTO cards (name, state, city, fone, email, column_id, entity_id, empresa_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *;
        `;
        const values = [card.name, card.state, card.city, card.fone, card.email, card.column_id, card.entity_id, card.empresa_id];
        await this.databaseService.query(insertQuery, values);
      }
      await this.databaseService.query('COMMIT');
    } catch (error) {
      await this.databaseService.query('ROLLBACK');
      throw new Error('Falha ao inserir cards: ' + error.message);
    }
  }

  async getColumnIdByName(name: string) {
    const query = 'SELECT id FROM process_columns WHERE name = $1';
    const result = await this.databaseService.query(query, [name]);
    return result.length > 0 ? result[0].id : null;
  }



  async searchCardsByName(name: string, entityId: number, empresaId: number) {
    // Prepara o termo de busca para encontrar qualquer correspondência parcial
    const likePattern = `%${name}%`; // Isso vai encontrar qualquer sequência que contenha 'name'

    const query = `
      -- Primeiro, selecionamos os cards do usuário atual que correspondem ao termo de busca
      SELECT c.*, me.nome_obra FROM cards c
      LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
      WHERE (c.name ILIKE $1 OR c.document_number ILIKE $1) AND c.entity_id = $2 AND c.empresa_id = $3

      UNION

      -- Depois, selecionamos os cards de todos os afilhados do usuário que correspondem ao termo de busca
      SELECT c.*, me.nome_obra FROM cards c
      LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
      INNER JOIN user_afilhados ua ON ua.afilhado_id = c.entity_id
      WHERE (c.name ILIKE $1 OR c.document_number ILIKE $1) AND ua.user_id = $2 AND c.empresa_id = $3

      UNION

      -- Finalmente, adicionamos os cards que foram compartilhados com este usuário
      SELECT c.*, me.nome_obra FROM cards c
      LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
      INNER JOIN card_shareds cs ON cs.card_id = c.card_id
      WHERE (c.name ILIKE $1 OR c.document_number ILIKE $1) AND cs.shared_user_id = $2 AND c.empresa_id = $3;
    `;
    const values = [likePattern, entityId, empresaId];
    return await this.databaseService.query(query, values);
  }




  async getOverdueTasks(userId: number) {
    const query = `
  SELECT ct.*, c.*, me.nome_obra  -- Adiciona o nome_obra de modulo_esquadrias
  FROM card_tasks ct
  JOIN cards c ON ct.card_id = c.card_id  -- Junta com a tabela de cards onde os IDs correspondem
  LEFT JOIN modulo_esquadrias me ON c.card_id = me.card_id  -- Junta com modulo_esquadrias onde card_id corresponde
  WHERE ct.user_id = $1
    AND ct.due_date::date <= CURRENT_DATE  -- Apenas tarefas vencidas
    AND ct.completed = false  -- Apenas tarefas não concluídas
  ORDER BY ct.due_date ASC;
`;
    const values = [userId];
    return await this.databaseService.query(query, values);
  }




  async deleteCardSharing(idShared: number) {
    const deleteQuery = `DELETE FROM card_shareds WHERE id = $1 RETURNING *;`;
    const result = await this.databaseService.query(deleteQuery, [idShared]);
    if (result.length === 0) {
      throw new Error('Erro ao excluir compartilhamento: Não encontrado');
    }
    return result[0]; // Retorna o compartilhamento excluído
  }

  async getSharedCards(cardId: number) {
    const query = `
      SELECT * FROM card_shareds
      WHERE card_id = $1;
    `;
    const values = [cardId];
    return await this.databaseService.query(query, values);
  }


  // card.service.ts
  async addCardSharing(card_id: number, owner_user_id: number, email: string, empresa_id: number) {
    // Primeiro, buscar o username do proprietário (owner) do card pelo owner_user_id
    const ownerQuery = `SELECT username FROM users WHERE id = $1`;
    const ownerResult = await this.databaseService.query(ownerQuery, [owner_user_id]);
    if (ownerResult.length === 0) {
      throw new Error('Dono do card não encontrado com o ID fornecido');
    }
    const owner_username = ownerResult[0].username;

    // Em seguida, buscar o usuário compartilhado pelo e-mail para obter o shared_user_id e shared_username
    const sharedUserQuery = `SELECT id, username FROM users WHERE email = $1`;
    const sharedUserResult = await this.databaseService.query(sharedUserQuery, [email]);
    if (sharedUserResult.length === 0) {
      throw new Error('Usuário não encontrado com o e-mail fornecido');
    }
    const shared_user_id = sharedUserResult[0].id;
    const shared_username = sharedUserResult[0].username;

    // Agora, inserir o compartilhamento na tabela 'card_shareds'
    const insertQuery = `
    INSERT INTO card_shareds (card_id, owner_user_id, owner_username, shared_user_id, shared_username, email, empresa_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
    const insertValues = [card_id, owner_user_id, owner_username, shared_user_id, shared_username, email, empresa_id];

    try {
      const insertResult = await this.databaseService.query(insertQuery, insertValues);
      return insertResult; // Retorna o compartilhamento recém-criado
    } catch (error) {
      throw new Error('Erro ao adicionar compartilhamento: ' + error.message);
    }
  }



  async updateTarefa(taskId: number, completed: boolean, cardId: number) {
    await this.databaseService.query('BEGIN');
    try {
      const query = `
        UPDATE card_tasks
        SET completed = $2,
            complete_date = CASE WHEN $2 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END
        WHERE task_id = $1
        RETURNING *;
      `;
      const taskValues = [taskId, completed];
      const taskResult = await this.databaseService.query(query, taskValues);

      if (completed) { // Only update the card if the task is completed
        const updateCardQuery = `
          UPDATE cards
          SET updated_at = CURRENT_TIMESTAMP
          WHERE card_id = $1;
        `;
        await this.databaseService.query(updateCardQuery, [cardId]);
      }

      await this.databaseService.query('COMMIT');
      return taskResult[0];
    } catch (error) {
      await this.databaseService.query('ROLLBACK');
      throw new Error('Erro ao atualizar a tarefa e o cartão: ' + error.message);
    }
  }


  async getCardTarefas(userId: number, cardId: number) {
    const query = `
      SELECT * FROM card_tasks
      WHERE user_id = $1 AND card_id = $2
      ORDER BY created_at DESC;
    `;
    const values = [userId, cardId];
    try {
      const result = await this.databaseService.query(query, values);
      return result;
    } catch (error) {
      throw new Error('Erro ao buscar tarefas: ' + error.message);
    }
  }

  async addCardTarefa(tarefaData) {
    // Inicia uma transação para garantir que todas as operações sejam realizadas de forma atômica
    await this.databaseService.query('BEGIN');

    try {
      // Primeiro, adiciona a nova tarefa
      const insertTaskQuery = `
        INSERT INTO card_tasks (user_id, card_id, task_type, description, due_date, completed, empresa_id )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;  -- Retorna a tarefa recém-criada
      `;
      const taskValues = [
        tarefaData.user_id,
        tarefaData.card_id,
        tarefaData.task_type,
        tarefaData.description,
        tarefaData.due_date,
        tarefaData.completed,
        tarefaData.empresa_id
      ];
      const taskResult = await this.databaseService.query(insertTaskQuery, taskValues);

      // Em seguida, atualiza o timestamp de updated_at no card associado
      const updateCardQuery = `
        UPDATE cards
        SET updated_at = CURRENT_TIMESTAMP
        WHERE card_id = $1;
      `;
      await this.databaseService.query(updateCardQuery, [tarefaData.card_id]);

      // Se todas as operações foram bem-sucedidas, confirma a transação
      await this.databaseService.query('COMMIT');

      // Retorna o resultado da tarefa recém-criada
      return taskResult[0];
    } catch (error) {
      // Em caso de erro, reverte todas as mudanças feitas durante a transação
      await this.databaseService.query('ROLLBACK');
      throw new Error('Erro ao adicionar tarefa: ' + error.message);
    }
  }



  async updatePotencialVenda(id: number, potencialVenda: number) {
    const query = `
      UPDATE cards
      SET potencial_venda = $2, updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $1
      RETURNING *;
    `;
    const values = [id, potencialVenda];
    try {
      const result = await this.databaseService.query(query, values);
      return result[0];  // Retorna a linha atualizada
    } catch (error) {
      throw new Error('Erro ao atualizar o potencial de venda');
    }
  }


  async getCardHistory(cardId: number) {
    const query = `
    SELECT * FROM card_history
    WHERE card_id = $1
    ORDER BY create_at ASC;
  `;
    const values = [cardId];
    const result = await this.databaseService.query(query, values);
    return result;
  }


  async addCardHistory(card_id: number, user_id: number, action_type: string, description: string, card_status: string, empresa_id: number) {
    try {
      // Inicia uma transação
      await this.databaseService.query('BEGIN');

      // Insere o registro no histórico
      const insertHistoryQuery = `
        INSERT INTO card_history(card_id, user_id, action_type, description, card_status, empresa_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const historyValues = [card_id, user_id, action_type, description, card_status, empresa_id];
      const historyResult = await this.databaseService.query(insertHistoryQuery, historyValues);

      // Atualiza o updated_at do card correspondente
      const updateCardQuery = `
        UPDATE cards
        SET updated_at = CURRENT_TIMESTAMP
        WHERE card_id = $1;
      `;
      await this.databaseService.query(updateCardQuery, [card_id]);

      // Finaliza a transação com sucesso
      await this.databaseService.query('COMMIT');

      return historyResult[0]; // Retorna o histórico adicionado
    } catch (error) {
      // Reverte todas as operações se ocorrer algum erro
      await this.databaseService.query('ROLLBACK');
      throw new Error('Erro ao adicionar histórico e atualizar o card: ' + error.message);
    }
  }



  async getTotalSales(entityId: number): Promise<number> {
    // Ajustando para usar 'timezone' apropriadament

    const query = `
      SELECT SUM(cost_value) AS total_sales
      FROM cards
      WHERE entity_id = $1
        AND status = 'Vendido'
        AND status_date >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
        AND status_date < date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + interval '1 month'
    `;
    const values = [entityId];
    const result = await this.databaseService.query(query, values);

    // Garante que a soma não retorne nulo, retornando 0 caso não haja vendas
    return result[0].total_sales ? parseFloat(result[0].total_sales) : 0;
  }

  async getTotalSalesFromAfilhados(userId: number): Promise<number> {
    //console.log('CardService - Buscando vendas dos afilhados para', userId);

    const query = `
      SELECT SUM(c.cost_value) AS total_sales
      FROM cards c
      JOIN user_afilhados ua ON c.entity_id = ua.afilhado_id
      WHERE ua.user_id = $1
        AND c.status = 'Vendido'
        AND c.status_date >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
        AND c.status_date < date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + interval '1 month'
    `;
    const values = [userId];
    try {
      const result = await this.databaseService.query(query, values);
      //console.log('Resultado das vendas dos afilhados', result);
      return result[0] && result[0].total_sales ? parseFloat(result[0].total_sales) : 0;
    } catch (error) {
      //console.error('Erro ao executar a query de vendas dos afilhados', error);
      return 0;  // Retornar 0 ou tratar de outra forma dependendo da necessidade
    }
  }

  async create(
    name: string,
    state: string,
    city: string,
    fone: string,
    email: string,
    column_id: number,
    entity_id: number,
    empresa_id: number
  ) {
    const status = ''; // Definindo status como uma string vazia
    const query = 'INSERT INTO cards(name, state, city, fone, email, column_id, entity_id, empresa_id, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const values = [name, state, city, fone, email, column_id, entity_id, empresa_id, status];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }


  // async findCardsByEntityAndEmpresa(entity_id: number, empresa_id: number) {
  //   const query = `
  //     -- Consulta atualizada para incluir apenas nome_obra da tabela modulo_esquadrias
  //     WITH CombinedCards AS (
  //       SELECT c.*, me.nome_obra
  //       FROM cards c
  //       LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
  //       WHERE c.entity_id = $1 AND c.empresa_id = $2

  //       UNION

  //       SELECT c.*, me.nome_obra
  //       FROM cards c
  //       INNER JOIN user_afilhados ua ON ua.afilhado_id = c.entity_id
  //       LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
  //       WHERE ua.user_id = $1 AND c.empresa_id = $2

  //       UNION

  //       SELECT c.*, me.nome_obra
  //       FROM cards c
  //       INNER JOIN card_shareds cs ON cs.card_id = c.card_id
  //       LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
  //       WHERE cs.shared_user_id = $1 AND c.empresa_id = $2
  //     )
  //     SELECT * FROM CombinedCards;
  //   `;

  //   const values = [entity_id, empresa_id];
  //   return await this.databaseService.query(query, values);
  // }

  // 

  async findCardsByEntityAndEmpresa(entity_id: number, empresa_id: number, dataInicial: string, dataFinal: string) {
    const query = `
      WITH CombinedCards AS (
        SELECT c.*, me.nome_obra, false AS compartilhamento
        FROM cards c
        LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
        WHERE c.entity_id = $1 AND c.empresa_id = $2
        AND c.created_at BETWEEN $3 AND $4
  
        UNION
  
        SELECT c.*, me.nome_obra, false AS compartilhamento
        FROM cards c
        INNER JOIN user_afilhados ua ON ua.afilhado_id = c.entity_id
        LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
        WHERE ua.user_id = $1 AND c.empresa_id = $2
        AND c.created_at BETWEEN $3 AND $4
  
        UNION
  
        SELECT c.*, me.nome_obra, true AS compartilhamento
        FROM cards c
        INNER JOIN card_shareds cs ON cs.card_id = c.card_id
        LEFT JOIN modulo_esquadrias me ON me.card_id = c.card_id
        WHERE cs.shared_user_id = $1 AND c.empresa_id = $2
        AND c.created_at BETWEEN $3 AND $4
      )
      SELECT * FROM CombinedCards;
    `;

    const values = [entity_id, empresa_id, dataInicial, dataFinal];
    return await this.databaseService.query(query, values);
  }







  // async update(
  //   id: number,
  //   name: string,
  //   state: string,
  //   city: string,
  //   fone: string,
  //   email: string,
  //   column_id: number,
  //   entity_id: number,
  //   empresa_id: number,
  //   document_number: string,
  //   cost_value: number,
  //   sale_value: number,
  //   status: string,
  //   origem: string,
  //   produto: string
  // ) {
  //   // Consulta para obter o status atual do banco de dados
  //   const statusCheckQuery = 'SELECT status FROM cards WHERE card_id = $1';
  //   const statusCheckResult = await this.databaseService.query(statusCheckQuery, [id]);

  //   if (statusCheckResult[0].status == status) {
  //     const query = `
  //       UPDATE cards
  //       SET name = $2, state = $3, city = $4, fone = $5, email = $6, column_id = $7, entity_id = $8,
  //           document_number = $9, cost_value = $10, sale_value = $11, status = $12, updated_at = CURRENT_TIMESTAMP, origem = $13, produto = $14
  //       WHERE card_id = $1
  //       RETURNING *
  //     `;
  //     const values = [id, name, state, city, fone, email, column_id, entity_id, document_number, cost_value, sale_value, status, origem, produto];
  //     const result = await this.databaseService.query(query, values);
  //     return result;
  //   } else {
  //     const query = `
  //       UPDATE cards
  //       SET name = $2, state = $3, city = $4, fone = $5, email = $6, column_id = $7, entity_id = $8,
  //           document_number = $9, cost_value = $10, sale_value = $11, status = $12, updated_at = CURRENT_TIMESTAMP,
  //           status_date = CURRENT_TIMESTAMP, origem = $13, produto = $14
  //       WHERE card_id = $1
  //       RETURNING *
  //     `;
  //     const values = [id, name, state, city, fone, email, column_id, entity_id, document_number, cost_value, sale_value, status, origem, produto];
  //     const result = await this.databaseService.query(query, values);
  //     return result;
  //   }
  // }



  // async update(
  //   id: number,
  //   name: string,
  //   state: string,
  //   city: string,
  //   fone: string,
  //   email: string,
  //   column_id: number,
  //   entity_id: number,
  //   empresa_id: number,
  //   document_number: string,
  //   cost_value: number,
  //   sale_value: number,
  //   status: string,
  //   origem: string,
  //   produto: string,
  //   status_date: string | null
  // ) {
  //   // Consulta para obter o status atual do banco de dados
  //   const statusCheckQuery = 'SELECT status FROM cards WHERE card_id = $1';
  //   const statusCheckResult = await this.databaseService.query(statusCheckQuery, [id]);

  //   if (statusCheckResult[0].status == status) {
  //     const query = `
  //       UPDATE cards
  //       SET name = $2, state = $3, city = $4, fone = $5, email = $6, column_id = $7, entity_id = $8,
  //           document_number = $9, cost_value = $10, sale_value = $11, status = $12, updated_at = CURRENT_TIMESTAMP, 
  //           status_date = $15, origem = $13, produto = $14
  //       WHERE card_id = $1
  //       RETURNING *
  //     `;
  //     const values = [id, name, state, city, fone, email, column_id, entity_id, document_number, cost_value, sale_value, status, origem, produto, status_date];
  //     const result = await this.databaseService.query(query, values);
  //     return result;
  //   } else {
  //     const query = `
  //       UPDATE cards
  //       SET name = $2, state = $3, city = $4, fone = $5, email = $6, column_id = $7, entity_id = $8,
  //           document_number = $9, cost_value = $10, sale_value = $11, status = $12, updated_at = CURRENT_TIMESTAMP,
  //           status_date = $15, origem = $13, produto = $14
  //       WHERE card_id = $1
  //       RETURNING *
  //     `;
  //     const values = [id, name, state, city, fone, email, column_id, entity_id, document_number, cost_value, sale_value, status, origem, produto, status_date];
  //     const result = await this.databaseService.query(query, values);
  //     return result;
  //   }
  // }


  async update(
    id: number,
    name: string,
    state: string,
    city: string,
    fone: string,
    email: string,
    column_id: number,
    entity_id: number,
    empresa_id: number,
    document_number: string,
    cost_value: number,
    sale_value: number,
    status: string,
    origem: string,
    produto: string,
    status_date: string | null,
    second_document_number: string,
    pedido_number: string,
    etiqueta_id: number
  ) {
    // Consulta para obter o status atual do banco de dados
    const statusCheckQuery = 'SELECT status FROM cards WHERE card_id = $1';
    const statusCheckResult = await this.databaseService.query(statusCheckQuery, [id]);

    if (statusCheckResult[0].status == status) {
      const query = `
            UPDATE cards
            SET name = $2, state = $3, city = $4, fone = $5, email = $6, column_id = $7, entity_id = $8,
                document_number = $9, cost_value = $10, sale_value = $11, status = $12, updated_at = CURRENT_TIMESTAMP,
                status_date = $15, origem = $13, produto = $14, second_document_number = $16, pedido_number = $17, etiqueta_id = $18
            WHERE card_id = $1
            RETURNING *
        `;
      const values = [id, name, state, city, fone, email, column_id, entity_id, document_number, cost_value, sale_value, status, origem, produto, status_date, second_document_number, pedido_number, etiqueta_id];
      const result = await this.databaseService.query(query, values);
      return result;
    } else {
      const query = `
            UPDATE cards
            SET name = $2, state = $3, city = $4, fone = $5, email = $6, column_id = $7, entity_id = $8,
                document_number = $9, cost_value = $10, sale_value = $11, status = $12, updated_at = CURRENT_TIMESTAMP,
                status_date = $15, origem = $13, produto = $14, second_document_number = $16, pedido_number = $17, etiqueta_id = $18
            WHERE card_id = $1
            RETURNING *
        `;
      const values = [id, name, state, city, fone, email, column_id, entity_id, document_number, cost_value, sale_value, status, origem, produto, status_date, second_document_number, pedido_number, etiqueta_id];
      const result = await this.databaseService.query(query, values);
      return result;
    }
  }







}
