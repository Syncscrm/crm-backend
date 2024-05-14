// src/components/processColumns/processColumns.controller.ts
import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProcessColumnsService } from './processColumns.service';

@Controller('process-columns')  
export class ProcessColumnsController {
  constructor(private readonly processColumnsService: ProcessColumnsService) {}


  @Get('by-company/:empresaId')
  async listByCompany(@Param('empresaId', ParseIntPipe) empresaId: number): Promise<any> {

    //console.log('Controller Processos - buscar',empresaId)

    return await this.processColumnsService.listByCompany(empresaId);
  }

  @Post('create')
  async create(@Body() body) {
    //console.log('Controller Processos')

    const { name, empresa_id, display_order, description } = body;
    return await this.processColumnsService.create(name, empresa_id, display_order, description);
  }

  // Implemente mais endpoints conforme necessário para listar, atualizar, deletar, etc.
}
