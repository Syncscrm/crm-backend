import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

import { JwtService } from '@nestjs/jwt';


// import * as imaps from 'imap-simple';
// import { simpleParser } from 'mailparser';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService, // Injetar o JwtService
  ) { }








  async changeUserPassword(userId: number, newPassword: string): Promise<void> {
    // Atualiza diretamente a senha no banco de dados
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await this.databaseService.query(query, [newPassword, userId]);
  }










  async getRecursosByEmpresaId(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM empresa_recursos WHERE empresa_id = $1';
    const result = await this.databaseService.query(query, [empresaId]);
    return result;
  }






















  // async createUserAndCompany(
  //   username: string,
  //   password: string,
  //   email: string,
  //   fone: string,
  //   segment: string
  // ) {
  //   const companyQuery = `
  //     INSERT INTO empresas (nome, telefone)
  //     VALUES ($1, $2)
  //     RETURNING id
  //   `;
  //   const companyValues = [username, fone];
  //   const companyResult = await this.databaseService.query(companyQuery, companyValues);
  //   const companyId = companyResult[0].id;

  //   const userQuery = `
  //     INSERT INTO users (
  //       username, password, email, empresa_id, is_premium, subscription_status, next_billing_date, meta_user, meta_grupo, entidade, access_level
  //     )
  //     VALUES ($1, $2, $3, $4, false, NULL, NULL, 0, 0, $5, 5)
  //     RETURNING id
  //   `;
  //   const userValues = [username, password, email, companyId, username];
  //   const userResult = await this.databaseService.query(userQuery, userValues);
  //   const userId = userResult[0].id;

  //   await this.createDefaultColumnsAndPermissions(companyId, userId, segment);

  //   return userResult[0];
  // }


  async createUserAndCompany(
    username: string,
    password: string,
    email: string,
    fone: string,
    segment: string
  ) {
    // Primeiro, criar a empresa
    const companyQuery = `
      INSERT INTO empresas (nome, telefone)
      VALUES ($1, $2)
      RETURNING id
    `;
    const companyValues = [username, fone];
    const companyResult = await this.databaseService.query(companyQuery, companyValues);
    const companyId = companyResult[0].id;

    // Segundo, criar o usuário
    const userQuery = `
      INSERT INTO users (
        username, password, email, fone, empresa_id, access_level, meta_user, meta_grupo, entidade
      )
      VALUES ($1, $2, $3, $4, $5, 5, 0, 0, $1)
      RETURNING id
    `;
    const userValues = [username, password, email, fone, companyId];
    const userResult = await this.databaseService.query(userQuery, userValues);
    const userId = userResult[0].id;

    // Criar colunas padrão e permissões
    await this.createDefaultColumnsAndPermissions(companyId, userId, segment);

    // Criar módulo customizado e campos personalizados
    await this.createCustomModuleAndFields(companyId, userId, segment);

    return userResult[0];
  }

  private async createDefaultColumnsAndPermissions(companyId: number, userId: number, segment: string) {
    const columns = [];

    switch (segment) {
      case 'CRM':
        columns.push({ name: 'Prospect', empresa_id: companyId, display_order: 1, description: 'Clientes potenciais' });
        columns.push({ name: 'Contactado', empresa_id: companyId, display_order: 2, description: 'Clientes contactados' });
        columns.push({ name: 'Negociação', empresa_id: companyId, display_order: 3, description: 'Negociações em andamento' });
        columns.push({ name: 'Fechado', empresa_id: companyId, display_order: 4, description: 'Negócios fechados' });
        columns.push({ name: 'Perdido', empresa_id: companyId, display_order: 5, description: 'Negócios perdidos' });
        break;

      case 'Tarefas':
        columns.push({ name: 'A Fazer', empresa_id: companyId, display_order: 1, description: 'Tarefas a fazer' });
        columns.push({ name: 'Em Progresso', empresa_id: companyId, display_order: 2, description: 'Tarefas em progresso' });
        columns.push({ name: 'Concluído', empresa_id: companyId, display_order: 3, description: 'Tarefas concluídas' });
        break;

      case 'Suporte Técnico':
        columns.push({ name: 'Novo Ticket', empresa_id: companyId, display_order: 1, description: 'Tickets recém-criados' });
        columns.push({ name: 'Em Progresso', empresa_id: companyId, display_order: 2, description: 'Tickets em progresso' });
        columns.push({ name: 'Em Espera', empresa_id: companyId, display_order: 3, description: 'Tickets em espera de resposta' });
        columns.push({ name: 'Resolvido', empresa_id: companyId, display_order: 4, description: 'Tickets resolvidos' });
        columns.push({ name: 'Fechado', empresa_id: companyId, display_order: 5, description: 'Tickets fechados' });
        break;

      case 'Gestão de Projetos':
        columns.push({ name: 'Ideias', empresa_id: companyId, display_order: 1, description: 'Ideias para novos projetos' });
        columns.push({ name: 'Planejamento', empresa_id: companyId, display_order: 2, description: 'Projetos em fase de planejamento' });
        columns.push({ name: 'Desenvolvimento', empresa_id: companyId, display_order: 3, description: 'Projetos em desenvolvimento' });
        columns.push({ name: 'Teste', empresa_id: companyId, display_order: 4, description: 'Projetos em fase de testes' });
        columns.push({ name: 'Concluído', empresa_id: companyId, display_order: 5, description: 'Projetos concluídos' });
        break;

      case 'Vendas e Marketing':
        columns.push({ name: 'Leads', empresa_id: companyId, display_order: 1, description: 'Potenciais clientes' });
        columns.push({ name: 'Contato Inicial', empresa_id: companyId, display_order: 2, description: 'Primeiro contato com os leads' });
        columns.push({ name: 'Demonstração', empresa_id: companyId, display_order: 3, description: 'Demonstrações de produto/serviço' });
        columns.push({ name: 'Proposta', empresa_id: companyId, display_order: 4, description: 'Propostas enviadas' });
        columns.push({ name: 'Fechado', empresa_id: companyId, display_order: 5, description: 'Vendas fechadas' });
        columns.push({ name: 'Pós-Venda', empresa_id: companyId, display_order: 6, description: 'Atividades de pós-venda' });
        break;

      default:
        throw new Error('Segmento inválido');
    }

    for (const column of columns) {
      const createdColumn = await this.createColumn(column.name, column.empresa_id, column.display_order, column.description);
      await this.addColumnToUser(userId, createdColumn.id);
      await this.addColumnPermissionToUser(userId, createdColumn.id, true, companyId);
    }
  }



  private async createColumn(name: string, empresa_id: number, display_order: number, description: string) {
    const query = 'INSERT INTO process_columns(name, empresa_id, display_order, description) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, empresa_id, display_order, description];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }




  private async createCustomModuleAndFields(companyId: number, userId: number, segment: string) {
    // Criar módulo customizado baseado no segmento
    const moduleQuery = `
      INSERT INTO modulos (name, description, empresa_id, order_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const moduleValues = [segment, `Módulo para ${segment}`, companyId, 1];
    const moduleResult = await this.databaseService.query(moduleQuery, moduleValues);
    const moduleId = moduleResult[0].id;

    // Associar módulo à empresa
    const moduleCompanyQuery = `
      INSERT INTO modulos_empresas (empresa_id, modulo_id, quantidade, data_compra)
      VALUES ($1, $2, $3, $4)
    `;
    const moduleCompanyValues = [companyId, moduleId, 1, new Date()];
    await this.databaseService.query(moduleCompanyQuery, moduleCompanyValues);

    // Criar campos personalizados baseados no segmento
    const customFields = this.getCustomFieldsForSegment(segment, companyId, moduleId);
    for (const field of customFields) {
      const customFieldQuery = `
        INSERT INTO custom_fields (name, label, type, empresa_id, module_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const customFieldValues = [field.name, field.label, field.type, companyId, moduleId];
      await this.databaseService.query(customFieldQuery, customFieldValues);
    }
  }

  private getCustomFieldsForSegment(segment: string, companyId: number, moduleId: number) {
    switch (segment) {
      case 'CRM':
        return [
          { name: 'client_name', label: 'Nome do Cliente', type: 'text', empresa_id: companyId, module_id: moduleId },
          { name: 'client_email', label: 'Email do Cliente', type: 'email', empresa_id: companyId, module_id: moduleId },
          { name: 'client_phone', label: 'Telefone do Cliente', type: 'text', empresa_id: companyId, module_id: moduleId },
        ];
      case 'Tarefas':
        return [
          { name: 'task_name', label: 'Nome da Tarefa', type: 'text', empresa_id: companyId, module_id: moduleId },
          { name: 'task_deadline', label: 'Prazo da Tarefa', type: 'date', empresa_id: companyId, module_id: moduleId },
        ];
      case 'Suporte Técnico':
        return [
          { name: 'ticket_id', label: 'ID do Ticket', type: 'text', empresa_id: companyId, module_id: moduleId },
          { name: 'issue_description', label: 'Descrição do Problema', type: 'textarea', empresa_id: companyId, module_id: moduleId },
          { name: 'priority', label: 'Prioridade', type: 'select', empresa_id: companyId, module_id: moduleId },
          { name: 'status', label: 'Status', type: 'select', empresa_id: companyId, module_id: moduleId },
        ];
      case 'Gestão de Projetos':
        return [
          { name: 'project_name', label: 'Nome do Projeto', type: 'text', empresa_id: companyId, module_id: moduleId },
          { name: 'start_date', label: 'Data de Início', type: 'date', empresa_id: companyId, module_id: moduleId },
          { name: 'end_date', label: 'Data de Término', type: 'date', empresa_id: companyId, module_id: moduleId },
          { name: 'project_manager', label: 'Gerente do Projeto', type: 'text', empresa_id: companyId, module_id: moduleId },
        ];
      case 'Vendas e Marketing':
        return [
          { name: 'campaign_name', label: 'Nome da Campanha', type: 'text', empresa_id: companyId, module_id: moduleId },
          { name: 'budget', label: 'Orçamento', type: 'number', empresa_id: companyId, module_id: moduleId },
          { name: 'target_audience', label: 'Público Alvo', type: 'textarea', empresa_id: companyId, module_id: moduleId },
          { name: 'conversion_rate', label: 'Taxa de Conversão', type: 'number', empresa_id: companyId, module_id: moduleId },
        ];
      default:
        return [];
    }


  }















  async addColumnPermissionToUser(userId: number, columnId: number, canEdit: boolean, empresaId: number): Promise<void> {
    console.log('addColumnPermissionToUser')
    const query = `
      INSERT INTO user_permissions (user_id, column_id, can_edit, empresa_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, column_id) DO UPDATE SET can_edit = EXCLUDED.can_edit, updated_at = CURRENT_TIMESTAMP
    `;
    await this.databaseService.query(query, [userId, columnId, canEdit, empresaId]);
  }

  async addColumnToUser(userId: number, columnId: number): Promise<void> {
    const query = 'INSERT INTO user_columns (user_id, column_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await this.databaseService.query(query, [userId, columnId]);
  }













  // ---------- modulo pedidos -------------------



  async findPedidoByCardId(cardId: number) {
    console.log('findPedidoByCardId')
    const query = `
    SELECT * FROM pedidos WHERE card_id = $1;
  `;
    const values = [cardId];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  //   async upsertPedido(pedidoData: any) {
  //     console.log('upsertPedido');
  //     const query = `
  //     INSERT INTO pedidos (
  //         card_id, numero_pedido, status_pedido, data_status, nome_obra, representante,
  //         nome_cliente, cpf_cnpj, telefone_cliente, nome_contato, email_nota_fiscal,
  //         representante_legal_nome, representante_legal_email, representante_legal_cpf,
  //         endereco_cobranca_responsavel, endereco_cobranca_telefone, endereco_cobranca_email,
  //         endereco_cobranca_logradouro, endereco_cobranca_numero, endereco_cobranca_complemento,
  //         endereco_cobranca_bairro, endereco_cobranca_cidade, endereco_cobranca_uf, endereco_cobranca_cep,
  //         endereco_cobranca_condominio, endereco_entrega_logradouro, endereco_entrega_numero,
  //         endereco_entrega_complemento, endereco_entrega_bairro, endereco_entrega_cidade,
  //         endereco_entrega_uf, endereco_entrega_cep, endereco_entrega_condominio, gestor_obra_nome,
  //         gestor_obra_telefone, gestor_obra_email, valor_total_contrato, valor_total_terceiros, condicoes_pagamento,
  //         condicoes_pagamento_terceiro, previsao_medicao, previsao_entrega, observacoes, empresa_id,
  //         valor_instalacao, valor_frete, valor_abatimento_showroom,
  //         valor_instalacao_pvc, valor_frete_esquadrias, valor_projeto, valor_vidros_separados,
  //         valor_externas_esquadrias, desconto_externas, valor_final_externas,
  //         valor_outros_esquadrias, desconto_outros, valor_final_outros
  //     ) VALUES (
  //         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
  //         $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39,
  //         $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57
  //     )
  //     ON CONFLICT (card_id) DO UPDATE SET
  //         numero_pedido = EXCLUDED.numero_pedido,
  //         status_pedido = EXCLUDED.status_pedido,
  //         data_status = EXCLUDED.data_status,
  //         nome_obra = EXCLUDED.nome_obra,
  //         representante = EXCLUDED.representante,
  //         nome_cliente = EXCLUDED.nome_cliente,
  //         cpf_cnpj = EXCLUDED.cpf_cnpj,
  //         telefone_cliente = EXCLUDED.telefone_cliente,
  //         nome_contato = EXCLUDED.nome_contato,
  //         email_nota_fiscal = EXCLUDED.email_nota_fiscal,
  //         representante_legal_nome = EXCLUDED.representante_legal_nome,
  //         representante_legal_email = EXCLUDED.representante_legal_email,
  //         representante_legal_cpf = EXCLUDED.representante_legal_cpf,
  //         endereco_cobranca_responsavel = EXCLUDED.endereco_cobranca_responsavel,
  //         endereco_cobranca_telefone = EXCLUDED.endereco_cobranca_telefone,
  //         endereco_cobranca_email = EXCLUDED.endereco_cobranca_email,
  //         endereco_cobranca_logradouro = EXCLUDED.endereco_cobranca_logradouro,
  //         endereco_cobranca_numero = EXCLUDED.endereco_cobranca_numero,
  //         endereco_cobranca_complemento = EXCLUDED.endereco_cobranca_complemento,
  //         endereco_cobranca_bairro = EXCLUDED.endereco_cobranca_bairro,
  //         endereco_cobranca_cidade = EXCLUDED.endereco_cobranca_cidade,
  //         endereco_cobranca_uf = EXCLUDED.endereco_cobranca_uf,
  //         endereco_cobranca_cep = EXCLUDED.endereco_cobranca_cep,
  //         endereco_cobranca_condominio = EXCLUDED.endereco_cobranca_condominio,
  //         endereco_entrega_logradouro = EXCLUDED.endereco_entrega_logradouro,
  //         endereco_entrega_numero = EXCLUDED.endereco_entrega_numero,
  //         endereco_entrega_complemento = EXCLUDED.endereco_entrega_complemento,
  //         endereco_entrega_bairro = EXCLUDED.endereco_entrega_bairro,
  //         endereco_entrega_cidade = EXCLUDED.endereco_entrega_cidade,
  //         endereco_entrega_uf = EXCLUDED.endereco_entrega_uf,
  //         endereco_entrega_cep = EXCLUDED.endereco_entrega_cep,
  //         endereco_entrega_condominio = EXCLUDED.endereco_entrega_condominio,
  //         gestor_obra_nome = EXCLUDED.gestor_obra_nome,
  //         gestor_obra_telefone = EXCLUDED.gestor_obra_telefone,
  //         gestor_obra_email = EXCLUDED.gestor_obra_email,
  //         valor_total_contrato = EXCLUDED.valor_total_contrato,
  //         valor_total_terceiros = EXCLUDED.valor_total_terceiros,
  //         condicoes_pagamento = EXCLUDED.condicoes_pagamento,
  //         condicoes_pagamento_terceiro = EXCLUDED.condicoes_pagamento_terceiro,
  //         previsao_medicao = EXCLUDED.previsao_medicao,
  //         previsao_entrega = EXCLUDED.previsao_entrega,
  //         observacoes = EXCLUDED.observacoes,
  //         valor_instalacao = EXCLUDED.valor_instalacao,
  //         valor_frete = EXCLUDED.valor_frete,
  //         valor_abatimento_showroom = EXCLUDED.valor_abatimento_showroom,
  //         valor_instalacao_pvc = EXCLUDED.valor_instalacao_pvc,
  //         valor_frete_esquadrias = EXCLUDED.valor_frete_esquadrias,
  //         valor_projeto = EXCLUDED.valor_projeto,
  //         valor_vidros_separados = EXCLUDED.valor_vidros_separados,
  //         valor_externas_esquadrias = EXCLUDED.valor_externas_esquadrias,
  //         desconto_externas = EXCLUDED.desconto_externas,
  //         valor_final_externas = EXCLUDED.valor_final_externas,
  //         valor_outros_esquadrias = EXCLUDED.valor_outros_esquadrias,
  //         desconto_outros = EXCLUDED.desconto_outros,
  //         valor_final_outros = EXCLUDED.valor_final_outros
  //     RETURNING *;
  //     `;

  //     const values = [
  //         pedidoData.card_id, pedidoData.numero_pedido, pedidoData.status_pedido, pedidoData.data_status, pedidoData.nome_obra,
  //         pedidoData.representante, pedidoData.nome_cliente, pedidoData.cpf_cnpj, pedidoData.telefone_cliente, pedidoData.nome_contato,
  //         pedidoData.email_nota_fiscal, pedidoData.representante_legal_nome, pedidoData.representante_legal_email, pedidoData.representante_legal_cpf,
  //         pedidoData.endereco_cobranca_responsavel, pedidoData.endereco_cobranca_telefone, pedidoData.endereco_cobranca_email,
  //         pedidoData.endereco_cobranca_logradouro, pedidoData.endereco_cobranca_numero, pedidoData.endereco_cobranca_complemento,
  //         pedidoData.endereco_cobranca_bairro, pedidoData.endereco_cobranca_cidade, pedidoData.endereco_cobranca_uf, pedidoData.endereco_cobranca_cep,
  //         pedidoData.endereco_cobranca_condominio, pedidoData.endereco_entrega_logradouro, pedidoData.endereco_entrega_numero,
  //         pedidoData.endereco_entrega_complemento, pedidoData.endereco_entrega_bairro, pedidoData.endereco_entrega_cidade,
  //         pedidoData.endereco_entrega_uf, pedidoData.endereco_entrega_cep, pedidoData.endereco_entrega_condominio, pedidoData.gestor_obra_nome,
  //         pedidoData.gestor_obra_telefone, pedidoData.gestor_obra_email, pedidoData.valor_total_contrato || null, pedidoData.valor_total_terceiros || null, pedidoData.condicoes_pagamento,
  //         pedidoData.condicoes_pagamento_terceiro, pedidoData.previsao_medicao, pedidoData.previsao_entrega, pedidoData.observacoes, pedidoData.empresa_id,
  //         pedidoData.valor_instalacao || null, pedidoData.valor_frete || null, pedidoData.valor_abatimento_showroom || null,
  //         pedidoData.valor_instalacao_pvc || null, pedidoData.valor_frete_esquadrias || null, pedidoData.valor_projeto || null, pedidoData.valor_vidros_separados || null,
  //         pedidoData.valor_externas_esquadrias || null, pedidoData.desconto_externas || null, pedidoData.valor_final_externas || null,
  //         pedidoData.valor_outros_esquadrias || null, pedidoData.desconto_outros || null, pedidoData.valor_final_outros || null
  //     ];

  //     return await this.databaseService.query(query, values);
  // }

  async upsertPedido(pedidoData: any) {
    const query = `
  INSERT INTO pedidos (
      card_id, numero_pedido, status_pedido, data_status, nome_obra, representante,
      nome_cliente, cpf_cnpj, telefone_cliente, nome_contato, email_nota_fiscal,
      representante_legal_nome, representante_legal_email, representante_legal_cpf,
      endereco_cobranca_responsavel, endereco_cobranca_telefone, endereco_cobranca_email,
      endereco_cobranca_logradouro, endereco_cobranca_numero, endereco_cobranca_complemento,
      endereco_cobranca_bairro, endereco_cobranca_cidade, endereco_cobranca_uf, endereco_cobranca_cep,
      endereco_cobranca_condominio, endereco_entrega_logradouro, endereco_entrega_numero,
      endereco_entrega_complemento, endereco_entrega_bairro, endereco_entrega_cidade,
      endereco_entrega_uf, endereco_entrega_cep, endereco_entrega_condominio, gestor_obra_nome,
      gestor_obra_telefone, gestor_obra_email, condicoes_pagamento, condicoes_pagamento_terceiro,
      previsao_medicao, previsao_entrega, observacoes, empresa_id, valor_instalacao,
      valor_frete, valor_abatimento_showroom, valor_instalacao_pvc, valor_frete_esquadrias,
      valor_projeto, valor_vidros_separados, valor_externas_esquadrias, desconto_externas,
      valor_outros_esquadrias, desconto_outros
  ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39,
      $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53
  )
  ON CONFLICT (card_id) DO UPDATE SET
      numero_pedido = EXCLUDED.numero_pedido,
      status_pedido = EXCLUDED.status_pedido,
      data_status = EXCLUDED.data_status,
      nome_obra = EXCLUDED.nome_obra,
      representante = EXCLUDED.representante,
      nome_cliente = EXCLUDED.nome_cliente,
      cpf_cnpj = EXCLUDED.cpf_cnpj,
      telefone_cliente = EXCLUDED.telefone_cliente,
      nome_contato = EXCLUDED.nome_contato,
      email_nota_fiscal = EXCLUDED.email_nota_fiscal,
      representante_legal_nome = EXCLUDED.representante_legal_nome,
      representante_legal_email = EXCLUDED.representante_legal_email,
      representante_legal_cpf = EXCLUDED.representante_legal_cpf,
      endereco_cobranca_responsavel = EXCLUDED.endereco_cobranca_responsavel,
      endereco_cobranca_telefone = EXCLUDED.endereco_cobranca_telefone,
      endereco_cobranca_email = EXCLUDED.endereco_cobranca_email,
      endereco_cobranca_logradouro = EXCLUDED.endereco_cobranca_logradouro,
      endereco_cobranca_numero = EXCLUDED.endereco_cobranca_numero,
      endereco_cobranca_complemento = EXCLUDED.endereco_cobranca_complemento,
      endereco_cobranca_bairro = EXCLUDED.endereco_cobranca_bairro,
      endereco_cobranca_cidade = EXCLUDED.endereco_cobranca_cidade,
      endereco_cobranca_uf = EXCLUDED.endereco_cobranca_uf,
      endereco_cobranca_cep = EXCLUDED.endereco_cobranca_cep,
      endereco_cobranca_condominio = EXCLUDED.endereco_cobranca_condominio,
      endereco_entrega_logradouro = EXCLUDED.endereco_entrega_logradouro,
      endereco_entrega_numero = EXCLUDED.endereco_entrega_numero,
      endereco_entrega_complemento = EXCLUDED.endereco_entrega_complemento,
      endereco_entrega_bairro = EXCLUDED.endereco_entrega_bairro,
      endereco_entrega_cidade = EXCLUDED.endereco_entrega_cidade,
      endereco_entrega_uf = EXCLUDED.endereco_entrega_uf,
      endereco_entrega_cep = EXCLUDED.endereco_entrega_cep,
      endereco_entrega_condominio = EXCLUDED.endereco_entrega_condominio,
      gestor_obra_nome = EXCLUDED.gestor_obra_nome,
      gestor_obra_telefone = EXCLUDED.gestor_obra_telefone,
      gestor_obra_email = EXCLUDED.gestor_obra_email,
      condicoes_pagamento = EXCLUDED.condicoes_pagamento,
      condicoes_pagamento_terceiro = EXCLUDED.condicoes_pagamento_terceiro,
      previsao_medicao = EXCLUDED.previsao_medicao,
      previsao_entrega = EXCLUDED.previsao_entrega,
      observacoes = EXCLUDED.observacoes,
      valor_instalacao = EXCLUDED.valor_instalacao,
      valor_frete = EXCLUDED.valor_frete,
      valor_abatimento_showroom = EXCLUDED.valor_abatimento_showroom,
      valor_instalacao_pvc = EXCLUDED.valor_instalacao_pvc,
      valor_frete_esquadrias = EXCLUDED.valor_frete_esquadrias,
      valor_projeto = EXCLUDED.valor_projeto,
      valor_vidros_separados = EXCLUDED.valor_vidros_separados,
      valor_externas_esquadrias = EXCLUDED.valor_externas_esquadrias,
      desconto_externas = EXCLUDED.desconto_externas,
      valor_outros_esquadrias = EXCLUDED.valor_outros_esquadrias,
      desconto_outros = EXCLUDED.desconto_outros
  RETURNING *;
  `;

    const values = [
      pedidoData.card_id, pedidoData.numero_pedido, pedidoData.status_pedido, pedidoData.data_status, pedidoData.nome_obra,
      pedidoData.representante, pedidoData.nome_cliente, pedidoData.cpf_cnpj, pedidoData.telefone_cliente, pedidoData.nome_contato,
      pedidoData.email_nota_fiscal, pedidoData.representante_legal_nome, pedidoData.representante_legal_email, pedidoData.representante_legal_cpf,
      pedidoData.endereco_cobranca_responsavel, pedidoData.endereco_cobranca_telefone, pedidoData.endereco_cobranca_email,
      pedidoData.endereco_cobranca_logradouro, pedidoData.endereco_cobranca_numero, pedidoData.endereco_cobranca_complemento,
      pedidoData.endereco_cobranca_bairro, pedidoData.endereco_cobranca_cidade, pedidoData.endereco_cobranca_uf, pedidoData.endereco_cobranca_cep,
      pedidoData.endereco_cobranca_condominio, pedidoData.endereco_entrega_logradouro, pedidoData.endereco_entrega_numero,
      pedidoData.endereco_entrega_complemento, pedidoData.endereco_entrega_bairro, pedidoData.endereco_entrega_cidade,
      pedidoData.endereco_entrega_uf, pedidoData.endereco_entrega_cep, pedidoData.endereco_entrega_condominio, pedidoData.gestor_obra_nome,
      pedidoData.gestor_obra_telefone, pedidoData.gestor_obra_email, pedidoData.condicoes_pagamento, pedidoData.condicoes_pagamento_terceiro,
      pedidoData.previsao_medicao, pedidoData.previsao_entrega, pedidoData.observacoes, pedidoData.empresa_id,
      pedidoData.valor_instalacao, pedidoData.valor_frete, pedidoData.valor_abatimento_showroom,
      pedidoData.valor_instalacao_pvc, pedidoData.valor_frete_esquadrias, pedidoData.valor_projeto, pedidoData.valor_vidros_separados,
      pedidoData.valor_externas_esquadrias, pedidoData.desconto_externas, pedidoData.valor_outros_esquadrias, pedidoData.desconto_outros
    ];

    return await this.databaseService.query(query, values);
  }

























  // --------------- email -----------------



  // private imapConfig = {
  //   imap: {
  //     user: 'wilianjuniordemellolopes@gmail.com',
  //     password: 'gnlh yyvi nnbv cvcj', 
  //     host: 'imap.gmail.com',
  //     port: 993,
  //     tls: true,
  //     tlsOptions: { rejectUnauthorized: false },
  //     authTimeout: 10000,
  //   },
  // };

  // async getEmails(clientEmail: string): Promise<any> {
  //   try {
  //     console.log('Iniciando conexão IMAP...');
  //     const connection = await imaps.connect(this.imapConfig);
  //     console.log('Conexão IMAP estabelecida.');
  //     await connection.openBox('INBOX');
  //     console.log('Caixa de entrada aberta...');

  //     const searchCriteria = ['ALL'];
  //     const fetchOptions = {
  //       bodies: ['HEADER', 'TEXT'],
  //       markSeen: false,
  //     };

  //     console.log('Iniciando busca de mensagens...');
  //     const messages = await connection.search(searchCriteria, fetchOptions);
  //     console.log(`Total de mensagens encontradas: ${messages.length}`);
  //     const emails = [];

  //     for (const item of messages) {
  //       const all = item.parts.find((part) => part.which === 'TEXT');
  //       const id = item.attributes.uid;
  //       const idHeader = 'Imap-Id: ' + id + '\r\n';

  //       console.log(`Processando mensagem com ID: ${id}`);
  //       const parsed = await simpleParser(idHeader + all.body);
  //       console.log('Mensagem parseada:', parsed);

  //       if (parsed.to && parsed.to.value && parsed.from && parsed.from.value) {
  //         console.log(`Email de: ${parsed.from.text}, para: ${parsed.to.text}`);
  //         if (parsed.to.value[0].address === clientEmail || parsed.from.value[0].address === clientEmail) {
  //           emails.push({
  //             subject: parsed.subject,
  //             date: parsed.date,
  //             from: parsed.from.text,
  //             to: parsed.to.text,
  //             text: parsed.text,
  //           });
  //         }
  //       }
  //     }

  //     console.log(`Total de emails filtrados: ${emails.length}`);
  //     return emails;
  //   } catch (error) {
  //     console.error('Erro ao obter emails:', error);
  //     throw new Error('Erro ao obter emails');
  //   }
  // }














  async getUserTasks(userId: number): Promise<any> {
    const query = 'SELECT * FROM card_tasks WHERE user_id = $1';
    const result = await this.databaseService.query(query, [userId]);
    return result;
  }
















  async updateColunaVendido(empresaId: number, colunaVendido: string): Promise<any> {
    const query = 'UPDATE empresas SET coluna_vendido = $1 WHERE id = $2 RETURNING *';
    const values = [colunaVendido, empresaId];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async updateColunaPerdido(empresaId: number, colunaPerdido: string): Promise<any> {
    const query = 'UPDATE empresas SET coluna_perdido = $1 WHERE id = $2 RETURNING *';
    const values = [colunaPerdido, empresaId];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async updateColunaArquivado(empresaId: number, colunaArquivado: string): Promise<any> {
    const query = 'UPDATE empresas SET coluna_arquivado = $1 WHERE id = $2 RETURNING *';
    const values = [colunaArquivado, empresaId];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }




  async buscarEmpresa(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM empresas WHERE id = $1';
    const result = await this.databaseService.query(query, [empresaId]);
    return result[0]; // Ajuste conforme a estrutura do retorno do seu databaseService
  }






  async getCores(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM cores WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }


  async createCor(name: string, empresa_id: number, descricao: string) {
    const query = 'INSERT INTO cores(name, empresa_id, descricao) VALUES($1, $2, $3) RETURNING *';
    const values = [name, empresa_id, descricao];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async updateCor(id: number, name: string) {
    const query = 'UPDATE cores SET name = $1 WHERE id = $2 RETURNING *';
    const values = [name, id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async deleteCor(id: number) {
    const query = 'DELETE FROM cores WHERE id = $1';
    const result = await this.databaseService.query(query, [id]);
    return result;
  }



  // --------------- create ------------

  async createEtiqueta(
    description: string,
    color: string,
    empresa_id: number,
    order: number,
  ) {
    const query = 'INSERT INTO etiquetas(description, color, empresa_id, "order") VALUES($1, $2, $3, $4) RETURNING *';
    const values = [description, color, empresa_id, order];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async createOrigem(name: string, empresa_id: number, descricao: string) {
    const query = 'INSERT INTO origens(name, empresa_id, descricao) VALUES($1, $2, $3) RETURNING *';
    const values = [name, empresa_id, descricao];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async createColuna(name: string, empresa_id: number, display_order: number, description: string) {
    const query = 'INSERT INTO process_columns(name, empresa_id, display_order, description) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, empresa_id, display_order, description];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async createProduto(name: string, empresa_id: number, descricao: string) {
    const query = 'INSERT INTO produtos(name, empresa_id, descricao) VALUES($1, $2, $3) RETURNING *';
    const values = [name, empresa_id, descricao];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }


  // -------------- delete ----------------
  async deleteEtiqueta(id: number) {
    const query = 'DELETE FROM etiquetas WHERE id = $1';
    const result = await this.databaseService.query(query, [id]);
    return result;
  }

  async deleteOrigem(id: number) {
    const query = 'DELETE FROM origens WHERE id = $1';
    const result = await this.databaseService.query(query, [id]);
    return result;
  }

  async deleteColuna(id: number) {
    const query = 'DELETE FROM process_columns WHERE id = $1';
    const result = await this.databaseService.query(query, [id]);
    return result;
  }

  async deleteProduto(id: number) {
    const query = 'DELETE FROM produtos WHERE id = $1';
    const result = await this.databaseService.query(query, [id]);
    return result;
  }

  //-------------- update ------------------

  async updateEtiqueta(id: number, description: string) {
    const query = 'UPDATE etiquetas SET description = $1 WHERE id = $2 RETURNING *';
    const values = [description, id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async updateOrigem(id: number, name: string) {
    const query = 'UPDATE origens SET name = $1 WHERE id = $2 RETURNING *';
    const values = [name, id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async updateColuna(id: number, name: string) {
    const query = 'UPDATE process_columns SET name = $1 WHERE id = $2 RETURNING *';
    const values = [name, id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  async updateProduto(id: number, name: string) {
    const query = 'UPDATE produtos SET name = $1 WHERE id = $2 RETURNING *';
    const values = [name, id];
    const result = await this.databaseService.query(query, values);
    return result[0];
  }

  // ---------- parameters - get  -------------
  async getEtiquetas(empresaId: number): Promise<any> {
    console.log('service getEtiquetas')

    const query = 'SELECT * FROM etiquetas WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getOrigens(empresaId: number): Promise<any> {
    console.log('service getOrigens')

    const query = 'SELECT * FROM origens WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getColumns(empresaId: number): Promise<any> {
    console.log('service getColumns')

    const query = 'SELECT * FROM process_columns WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getProdutos(empresaId: number): Promise<any> {
    console.log('service getProdutos')

    const query = 'SELECT * FROM produtos WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

























  // ---------- excel -------------
  async getCardsByEmpresaId(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM cards WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getUsersByEmpresaId(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM users WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getCardHistoryByEmpresaId(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM card_history WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getCardTasksByEmpresaId(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM card_tasks WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }

  async getModuloEsquadriasByEmpresaId(empresaId: number): Promise<any> {
    const query = 'SELECT * FROM modulo_esquadrias WHERE empresa_id = $1';
    return this.databaseService.query(query, [empresaId]);
  }














































  async getUserColumnPermissions(userId: number): Promise<{ columnId: number, canEdit: boolean }[]> {
    console.log('getUserColumnPermissions')
    const query = 'SELECT column_id AS "columnId", can_edit AS "canEdit" FROM user_permissions WHERE user_id = $1';
    const result = await this.databaseService.query(query, [userId]);
    return result;
  }


  async removeColumnPermissionFromUser(userId: number, columnId: number): Promise<void> {
    console.log('removeColumnPermissionFromUser')
    const query = 'DELETE FROM user_permissions WHERE user_id = $1 AND column_id = $2';
    await this.databaseService.query(query, [userId, columnId]);
  }









  async addAfilhadoToUser(userId: number, afilhadoId: number): Promise<void> {
    const query = 'INSERT INTO user_afilhados (user_id, afilhado_id) VALUES ($1, $2)';
    await this.databaseService.query(query, [userId, afilhadoId]);
  }

  async removeAfilhadoFromUser(userId: number, afilhadoId: number): Promise<void> {
    const query = 'DELETE FROM user_afilhados WHERE user_id = $1 AND afilhado_id = $2';
    await this.databaseService.query(query, [userId, afilhadoId]);
  }

  // async getUserAfilhados(userId: number): Promise<any[]> {
  //   const query = 'SELECT u.* FROM users u JOIN user_afilhados ua ON ua.afilhado_id = u.id WHERE ua.user_id = $1';
  //   const result = await this.databaseService.query(query, [userId]);
  //   return result;
  // }

  async getUserAfilhados(userId: number): Promise<any[]> {
    const query = `
      SELECT u.*, a.address, a.city, a.state, a.cep
      FROM users u
      JOIN user_afilhados ua ON ua.afilhado_id = u.id
      LEFT JOIN addresses a ON a.user_id = u.id
      WHERE ua.user_id = $1
    `;
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











  // Método para contar usuários por empresa_id
  async countUsersByEmpresaId(empresaId: number): Promise<number> {
    const query = 'SELECT COUNT(*) FROM users WHERE empresa_id = $1';
    const result = await this.databaseService.query(query, [empresaId]);

    console.log('Numero de usuários atual: ', parseInt(result[0].count, 10))
    return parseInt(result[0].count, 10);
  }

  // Método para obter o número de licenças de uma empresa
  async getNumeroDeLicencas(empresaId: number): Promise<number> {
    const query = 'SELECT numero_de_licencas FROM empresas WHERE id = $1';
    const result = await this.databaseService.query(query, [empresaId]);
    console.log('Numero de licenças contratadas: ', result[0].numero_de_licencas)


    return result[0].numero_de_licencas;
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

    // Verificar se o número de usuários não excede o número de licenças
    const userCount = await this.countUsersByEmpresaId(empresa_id);
    const numeroDeLicencas = await this.getNumeroDeLicencas(empresa_id);

    if (userCount >= numeroDeLicencas) {
      throw new Error('Número de licenças excedido. Não é possível criar novos usuários.');
    }

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

    if (!user.is_active) {
      throw new Error('Usuário inativo');
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


  // async updateUser(
  //   userId: number,
  //   updates: {
  //     username?: string,
  //     fone?: string,
  //     avatar?: string,
  //     is_active?: boolean,
  //     meta_user?: number,
  //     meta_grupo?: number,
  //     entidade?: string,
  //     access_level?: number,
  //     // Adicionar novos campos de endereço
  //     address?: string,
  //     city?: string,
  //     state?: string,
  //     cep?: string
  //   }
  // ): Promise<any> {
  //   const queryParts: string[] = [];
  //   const queryValues: any[] = [];

  //   // Atualização da tabela de usuários
  //   Object.entries(updates).forEach(([key, value], index) => {
  //     if (value !== undefined && ['username', 'fone', 'avatar', 'is_active', 'meta_user', 'meta_grupo', 'entidade', 'access_level'].includes(key)) {
  //       queryParts.push(`${key} = $${index + 1}`);
  //       queryValues.push(value);
  //     }
  //   });

  //   if (queryParts.length > 0) {
  //     const query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = $${queryParts.length + 1}`;
  //     queryValues.push(userId);
  //     await this.databaseService.query(query, queryValues);
  //   }

  //   // Atualização da tabela de endereços
  //   const addressParts: string[] = [];
  //   const addressValues: any[] = [];

  //   ['address', 'city', 'state', 'cep'].forEach((field, index) => {
  //     if (updates[field] !== undefined) {
  //       addressParts.push(`${field} = $${index + 1}`);
  //       addressValues.push(updates[field]);
  //     }
  //   });

  //   if (addressParts.length > 0) {
  //     addressValues.push(userId);
  //     const addressQuery = `UPDATE addresses SET ${addressParts.join(', ')} WHERE user_id = $${addressParts.length + 1}`;
  //     await this.databaseService.query(addressQuery, addressValues);
  //   }

  //   return { message: "Usuário e endereço atualizados com sucesso." };
  // }



  // async updateUser(
  //   userId: number,
  //   updates: {
  //     username?: string,
  //     fone?: string,
  //     avatar?: string,
  //     is_active?: boolean,
  //     meta_user?: number,
  //     meta_grupo?: number,
  //     entidade?: string,
  //     access_level?: number,
  //     address?: string,
  //     city?: string,
  //     state?: string,
  //     cep?: string
  //   }
  // ): Promise<any> {
  //   const queryParts: string[] = [];
  //   const queryValues: any[] = [];

  //   // Atualização da tabela de usuários
  //   Object.entries(updates).forEach(([key, value], index) => {
  //     if (value !== undefined && ['username', 'fone', 'avatar', 'is_active', 'meta_user', 'meta_grupo', 'entidade', 'access_level'].includes(key)) {
  //       queryParts.push(`${key} = $${index + 1}`);
  //       queryValues.push(value);
  //     }
  //   });

  //   if (queryParts.length > 0) {
  //     const query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = $${queryParts.length + 1}`;
  //     queryValues.push(userId);
  //     await this.databaseService.query(query, queryValues);
  //   }

  //   // Verificar se existe um endereço associado ao usuário
  //   const addressCheckQuery = 'SELECT COUNT(*) FROM addresses WHERE user_id = $1';
  //   const addressCheckResult = await this.databaseService.query(addressCheckQuery, [userId]);
  //   const addressExists = parseInt(addressCheckResult[0].count, 10) > 0;

  //   // Atualização ou criação da tabela de endereços
  //   if (addressExists) {
  //     const addressParts: string[] = [];
  //     const addressValues: any[] = [];

  //     ['address', 'city', 'state', 'cep'].forEach((field, index) => {
  //       if (updates[field] !== undefined) {
  //         addressParts.push(`${field} = $${index + 1}`);
  //         addressValues.push(updates[field]);
  //       }
  //     });

  //     if (addressParts.length > 0) {
  //       addressValues.push(userId);
  //       const addressQuery = `UPDATE addresses SET ${addressParts.join(', ')} WHERE user_id = $${addressParts.length + 1}`;
  //       await this.databaseService.query(addressQuery, addressValues);
  //     }
  //   } else {
  //     const addressQuery = 'INSERT INTO addresses(user_id, address, city, state, cep) VALUES($1, $2, $3, $4, $5)';
  //     const addressValues = [userId, updates.address, updates.city, updates.state, updates.cep];
  //     await this.databaseService.query(addressQuery, addressValues);
  //   }

  //   return { message: "Usuário e endereço atualizados com sucesso." };
  // }


 
  







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
      user_type?: string,
      address?: string,
      city?: string,
      state?: string,
      cep?: string
    }
  ): Promise<any> {
    const userFields = ['username', 'fone', 'avatar', 'is_active', 'meta_user', 'meta_grupo', 'entidade', 'access_level', 'user_type'];
    const addressFields = ['address', 'city', 'state', 'cep'];
    
    // Atualização da tabela de usuários
    const userUpdates = userFields.filter(field => updates[field] !== undefined);
    const userQueryParts = userUpdates.map((field, index) => `${field} = $${index + 1}`);
    const userQueryValues = userUpdates.map(field => updates[field]);
    
    if (userQueryParts.length > 0) {
      const query = `UPDATE users SET ${userQueryParts.join(', ')} WHERE id = $${userQueryParts.length + 1}`;
      userQueryValues.push(userId);
      await this.databaseService.query(query, userQueryValues);
    }
  
    // Verificar se existe um endereço associado ao usuário
    const addressCheckQuery = 'SELECT COUNT(*) FROM addresses WHERE user_id = $1';
    const addressCheckResult = await this.databaseService.query(addressCheckQuery, [userId]);
    const addressExists = parseInt(addressCheckResult[0].count, 10) > 0;
  
    // Atualização ou criação da tabela de endereços
    const addressUpdates = addressFields.filter(field => updates[field] !== undefined);
    const addressQueryParts = addressUpdates.map((field, index) => `${field} = $${index + 1}`);
    const addressQueryValues = addressUpdates.map(field => updates[field]);
    
    if (addressQueryParts.length > 0) {
      if (addressExists) {
        addressQueryValues.push(userId);
        const addressQuery = `UPDATE addresses SET ${addressQueryParts.join(', ')} WHERE user_id = $${addressQueryParts.length + 1}`;
        await this.databaseService.query(addressQuery, addressQueryValues);
      } else {
        const addressQuery = 'INSERT INTO addresses(user_id, address, city, state, cep) VALUES($1, $2, $3, $4, $5)';
        addressQueryValues.unshift(userId); // Adiciona userId no início
        await this.databaseService.query(addressQuery, addressQueryValues);
      }
    }
  
    return { message: "Usuário e endereço atualizados com sucesso." };
  }

  
  





}
