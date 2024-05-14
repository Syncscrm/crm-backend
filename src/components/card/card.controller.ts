// src/components/processColumns/processColumns.controller.ts
import { Controller, Query, Post, Body, Get, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @Post('new-participante')
  async novoParticipante(@Body() body) {
      const {
          name, email, telefone, endereco, tipo, state, city
      } = body;
  
      return await this.cardService.novoParticipante(name, email, telefone, endereco, tipo, state, city);
  }
  

  @Post('add-history-import-suiteflow')
  async addCardHistoryImportSuiteFlow(@Body() body) {
    const { card_id, user_id, action_type, description, card_status, create_at } = body;
    // Passando o timestamp para o serviço
    return await this.cardService.addCardHistoryImportSuiteFlow(card_id, user_id, action_type, description, card_status, create_at);
  }
  

  @Post('import-suiteflow')
  async importSuiteFlow(@Body() body) {
    const {
      name, column_id, entity_id, empresa_id, document_number, cost_value,
      origem, produto, motivo_venda_perdida, nivel_prioridade, sale_value,
      potencial_venda, status, status_date, updated_at, email, fone, state, city
    } = body;

    return await this.cardService.importSuiteFlow(
      name, column_id, entity_id, empresa_id, document_number, cost_value,
      origem, produto, motivo_venda_perdida, nivel_prioridade, sale_value,
      potencial_venda, status, status_date, updated_at, email, fone, state, city
    );
  }
  

  @Post('import')
  async import(@Body() body) {
    //console.log('%%%%%%% Controller Card')

    const { name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value } = body;
    return await this.cardService.import(name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value);
  }


  @Post('update-column')
  async updateCardColumn(@Body() body) {
    const { cardId, columnId } = body;
    return await this.cardService.updateCardColumn(cardId, columnId);
  }

  // MODULO DE ESQUADRIAS

  // Rota para buscar as informações do módulo de esquadrias por card_id
  @Get(':cardId/esquadrias')
  async getEsquadrias(@Param('cardId') cardId: number) {
    return await this.cardService.getEsquadrias(cardId);
  }

  @Post('upsert')
  async upsertEsquadria(@Body() esquadriaData) {
    console.log('modulo esquadrias controller')
    return await this.cardService.upsertEsquadria(esquadriaData);
  }

  @Post('update-status')
  async updateCardStatus(@Body() body) {
    const { id, status } = body;
    return await this.cardService.updateCardStatus(id, status);
  }


  @Get('/columns/findByName')
  async getColumnIdByName(@Query('name') name: string) {
    return this.cardService.getColumnIdByName(name);
  }

  @Post('/cards/createBulk')
  async createBulkCards(@Body() cards: any[]) {
    return this.cardService.createBulkCards(cards);
  }


  @Get('search')
  async searchCardsByName(
    @Query('name') name: string,
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number
  ) {
    return await this.cardService.searchCardsByName(name, entityId, empresaId);
  }

  @Get('tasks/overdue/:userId')
  async getOverdueTasks(@Param('userId', ParseIntPipe) userId: number) {
    return await this.cardService.getOverdueTasks(userId);
  }

  @Delete('delete-compartilhar/:idShared')
  async deleteCardSharing(@Param('idShared', ParseIntPipe) idShared: number) {
    return await this.cardService.deleteCardSharing(idShared);
  }

  @Get('compartilhar/:cardId')
  async getSharedCards(
    @Param('cardId', ParseIntPipe) cardId: number
  ) {
    return await this.cardService.getSharedCards(cardId);
  }
  @Post('add-compartilhar')
  async addCardSharing(@Body() body) {
    const { card_id, owner_user_id, email } = body;  // Removido shared_user_id daqui
    return await this.cardService.addCardSharing(card_id, owner_user_id, email);
  }

  @Post('update-tarefa')
  async updateTarefa(@Body() body) {
    // Garantir que o card_id também é passado junto com task_id e completed
    return await this.cardService.updateTarefa(body.task_id, body.completed, body.card_id);
  }


  @Post('update-potencial-venda')
  async updatePotencialVenda(@Body() body) {
    const { id, potencial_venda } = body;
    return await this.cardService.updatePotencialVenda(id, potencial_venda);
  }

  @Get('history/:cardId')
  async getCardHistory(
    @Param('cardId', ParseIntPipe) cardId: number
  ) {
    return await this.cardService.getCardHistory(cardId);
  }


  @Get('tarefas/:userId/:cardId')
  async getCardTarefas(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('cardId', ParseIntPipe) cardId: number
  ) {
    return await this.cardService.getCardTarefas(userId, cardId);
  }

  @Post('add-tarefa')
  async addCardTarefa(@Body() body) {
    return await this.cardService.addCardTarefa(body);
  }

  @Post('add-history')
  async addCardHistory(@Body() body) {
    const { card_id, user_id, action_type, description, card_status } = body;
    return await this.cardService.addCardHistory(card_id, user_id, action_type, description, card_status);
  }


  @Post('create')
  async create(@Body() body) {
    //console.log('%%%%%%% Controller Card')

    const { name, state, city, fone, email, column_id, entity_id, empresa_id } = body;
    return await this.cardService.create(name, state, city, fone, email, column_id, entity_id, empresa_id);
  }

  @Get('find/:entityId/:empresaId')
  async findCards(@Param('entityId', ParseIntPipe) entityId: number, @Param('empresaId', ParseIntPipe) empresaId: number) {
    return await this.cardService.findCardsByEntityAndEmpresa(entityId, empresaId);
  }


  

  @Post('update')
  async update(@Body() body) {
    const { id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status } = body;
    return await this.cardService.update(id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status);
  }

  @Get('sales/total/:entityId')
  async getTotalSales(
    @Param('entityId', ParseIntPipe) entityId: number
  ) {
    //console.log('%%%%%%% Controller Card')
    return await this.cardService.getTotalSales(entityId);
  }

  @Get('sales/total-afilhados/:entityId')
  async getTotalSalesFromAfilhados(
    @Param('entityId', ParseIntPipe) entityId: number
  ) {
    //console.log('Controller - Total de vendas dos afilhados para o usuário', entityId);
    return await this.cardService.getTotalSalesFromAfilhados(entityId);
  }


}