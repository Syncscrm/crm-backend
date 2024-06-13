// src/components/processColumns/processColumns.controller.ts
import { Controller, Query, Post, Body, Get, Param, ParseIntPipe, Delete, Put } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @Get(':cardId/anexos')
  async getAnexosByCardId(@Param('cardId', ParseIntPipe) cardId: number) {
    const anexos = await this.cardService.getAnexosByCardId(cardId);
    console.log("Anexos encontrados:", anexos);
    return anexos;
  }

  @Post(':cardId/add-anexo')
  async addAnexo(@Param('cardId', ParseIntPipe) cardId: number, @Body() body) {
    const { empresa_id, url, nome_arquivo, tamanho, tipo_arquivo } = body;
    console.log("Recebendo anexo:", { cardId, empresa_id, url, nome_arquivo, tamanho, tipo_arquivo });
    return await this.cardService.addAnexo(cardId, empresa_id, url, nome_arquivo, tamanho, tipo_arquivo);
  }

  @Delete(':anexoId/delete-anexo')
  async deleteAnexo(@Param('anexoId', ParseIntPipe) anexoId: number) {
    const deletedAnexo = await this.cardService.deleteAnexo(anexoId);
    console.log("Anexo deletado:", deletedAnexo);
    return deletedAnexo;
  }

  @Get('buscar-por-url')
  async getAnexoByUrl(@Query('url') url: string) {
    const anexo = await this.cardService.getAnexoByUrl(url);
    console.log("Anexo encontrado:", anexo);
    return anexo;
  }
























  // Endpoint para excluir registros em cards pelo card_id

  // src/components/processColumns/processColumns.controller.ts
  @Delete(':cardId/delete-all-anexos')
  async deleteAllAnexosByCardId(@Param('cardId', ParseIntPipe) cardId: number) {
    return await this.cardService.deleteAllAnexosByCardId(cardId);
  }


  @Delete(':cardId')
  async deleteCard(@Param('cardId', ParseIntPipe) cardId: number) {
    return await this.cardService.deleteCard(cardId);
  }



  // Endpoint para excluir registros em card_history pelo card_id
  @Delete(':cardId/history')
  async deleteCardHistory(@Param('cardId', ParseIntPipe) cardId: number) {
    return await this.cardService.deleteCardHistory(cardId);
  }

  // Endpoint para excluir registros em card_tasks pelo card_id
  @Delete(':cardId/tasks')
  async deleteCardTasks(@Param('cardId', ParseIntPipe) cardId: number) {
    return await this.cardService.deleteCardTasks(cardId);
  }

  // Endpoint para excluir registros em card_shareds pelo card_id
  @Delete(':cardId/shareds')
  async deleteCardShareds(@Param('cardId', ParseIntPipe) cardId: number) {
    return await this.cardService.deleteCardShareds(cardId);
  }

  // Endpoint para excluir registros em modulo_esquadrias pelo card_id
  @Delete(':cardId/esquadrias')
  async deleteModuloEsquadrias(@Param('cardId', ParseIntPipe) cardId: number) {
    return await this.cardService.deleteModuloEsquadrias(cardId);
  }


























  @Post('/enviar')
  async enviarMensagem(@Body() body: { numero: string; contato: string; mensagem: string }): Promise<string> {
    const { numero, contato, mensagem } = body;

    console.log('controller', numero, contato, mensagem)
    await this.cardService.enviarMensagemParaBotConversa(numero, contato, mensagem);
    return 'Mensagem enviada com sucesso!';
  }







  @Post('update-block-column')
  async updateBlockColumn(@Body() body) {
    const { id, block_column } = body;
    return await this.cardService.updateBlockColumn(id, block_column);
  }




  @Post('update-etiqueta')
  async updateCardEtiqueta(@Body() body) {
    const { cardId, etiqueta_id } = body;
    return await this.cardService.updateCardEtiqueta(cardId, etiqueta_id);
  }

  @Get('etiquetas/:empresaId')
  async buscarEtiquetas(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return await this.cardService.buscarEtiquetas(empresaId);
  }




  @Get('sold-last-minute/:empresaId')
  async findSoldLastMinute(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return await this.cardService.findSoldLastMinute(empresaId);
  }






  @Get('cor/:empresaId')
  async bucarCor(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return await this.cardService.bucarCor(empresaId);
  }

  @Get('produtos/:empresaId')
  async bucarProdutos(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return await this.cardService.bucarProdutos(empresaId);
  }

  @Get('origens/:empresaId')
  async bucarOrigens(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return await this.cardService.bucarOrigens(empresaId);
  }



  // No controlador (controller)
  @Put('mark-messages-as-read/:userId/:destinatarioId')
  async markMessagesAsRead(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('destinatarioId', ParseIntPipe) destinatarioId: number,
  ) {
    await this.cardService.markMessagesAsRead(userId, destinatarioId);
  }


  // No controlador (controller)
  @Get('unread-messages-count/:userId/:senderId')
  async getUnreadMessagesCount(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('senderId', ParseIntPipe) senderId: number,
  ) {
    return await this.cardService.getUnreadMessagesCount(userId, senderId);
  }

  // No controlador (controller)
  @Get('total-unread-messages-count/:userId')
  async getTotalUnreadMessagesCount(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.cardService.getTotalUnreadMessagesCount(userId);
  }





  @Get('search-card-id')
  async searchCardById(
    @Query('card_id') cardId: number,
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number
  ) {
    console.log('cardId - controller', cardId)

    return await this.cardService.searchCardById(cardId, entityId, empresaId);
  }



  @Get('fetch-messages/:userId/:destinatarioId')
  async getMessages(

    @Param('userId', ParseIntPipe) userId: number,
    @Param('destinatarioId', ParseIntPipe) destinatarioId: number
  ) {

    return await this.cardService.getMessages(userId, destinatarioId);
  }


  @Post('add-messenger')
  async addMessage(@Body() body) {
    const { id_remetente, id_destinatario, message, read } = body;
    return await this.cardService.addMessage(id_remetente, id_destinatario, message, read);
  }



  @Get('pcp/:entityId/:empresaId')
  async findCardsPCP(@Param('entityId', ParseIntPipe) entityId: number, @Param('empresaId', ParseIntPipe) empresaId: number) {
    return await this.cardService.findCardsPCP(entityId, empresaId);
  }





  @Post('new-participante')
  async novoParticipante(@Body() body) {
    const {
      name, email, telefone, endereco, tipo, state, city
    } = body;

    return await this.cardService.novoParticipante(name, email, telefone, endereco, tipo, state, city);
  }


  @Post('add-history-import-suiteflow')
  async addCardHistoryImportSuiteFlow(@Body() body) {
    const { card_id, user_id, action_type, description, card_status, create_at, empresa_id } = body;
    // Passando o timestamp para o serviço
    return await this.cardService.addCardHistoryImportSuiteFlow(card_id, user_id, action_type, description, card_status, create_at, empresa_id);
  }


  @Post('import-suiteflow')
  async importSuiteFlow(@Body() body) {
    const {
      created_at, name, column_id, entity_id, empresa_id, document_number, cost_value,
      origem, produto, motivo_venda_perdida, nivel_prioridade, sale_value,
      potencial_venda, status, status_date, updated_at, email, fone, state, city, pedido_number, etapa_producao, etiqueta_id
    } = body;

    return await this.cardService.importSuiteFlow(
      created_at, name, column_id, entity_id, empresa_id, document_number, cost_value,
      origem, produto, motivo_venda_perdida, nivel_prioridade, sale_value,
      potencial_venda, status, status_date, updated_at, email, fone, state, city, pedido_number, etapa_producao, etiqueta_id
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
    //console.log('modulo esquadrias controller')
    return await this.cardService.upsertEsquadria(esquadriaData);
  }

  @Post('update-status')
  async updateCardStatus(@Body() body) {
    const { id, status, columnId } = body;
    return await this.cardService.updateCardStatus(id, status, columnId);
  }


  @Post('update-status-venda-perdida')
  async updateCardStatusVendaPerdida(@Body() body) {
    const { id, status, motivo, columnId } = body;
    return await this.cardService.updateCardStatusVendaPerdida(id, status, motivo, columnId);
  }

  @Post('update-arquivados')
  async updateCardArquivado(@Body() body) {
    const { id, status, columnId } = body;
    return await this.cardService.updateCardArquivado(id, status, columnId);
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
    const { card_id, owner_user_id, email, empresa_id } = body;  // Removido shared_user_id daqui
    return await this.cardService.addCardSharing(card_id, owner_user_id, email, empresa_id);
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
    const { card_id, user_id, action_type, description, card_status, empresa_id } = body;
    return await this.cardService.addCardHistory(card_id, user_id, action_type, description, card_status, empresa_id);
  }


  @Post('create')
  async create(@Body() body) {
    //console.log('%%%%%%% Controller Card')

    const { name, state, city, fone, email, column_id, entity_id, empresa_id } = body;
    return await this.cardService.create(name, state, city, fone, email, column_id, entity_id, empresa_id);
  }

  // @Get('find/:entityId/:empresaId')
  // async findCards(@Param('entityId', ParseIntPipe) entityId: number, @Param('empresaId', ParseIntPipe) empresaId: number) {
  //   return await this.cardService.findCardsByEntityAndEmpresa(entityId, empresaId);
  // }

  @Get('find/:entityId/:empresaId')
  async findCards(
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string
  ) {
    return await this.cardService.findCardsByEntityAndEmpresa(entityId, empresaId, dataInicial, dataFinal);
  }




  // @Post('update')
  // async update(@Body() body) {
  //   const { id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status, origem, produto } = body;
  //   return await this.cardService.update(id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status, origem, produto);
  // }


  @Post('update')
  async update(@Body() body) {
    const { id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status, origem, produto, status_date, second_document_number, pedido_number, etiqueta_id } = body;
    return await this.cardService.update(id, name, state, city, fone, email, column_id, entity_id, empresa_id, document_number, cost_value, sale_value, status, origem, produto, status_date, second_document_number, pedido_number, etiqueta_id);
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
