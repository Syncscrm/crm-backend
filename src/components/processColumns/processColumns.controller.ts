import { Controller, Post, Body, Get, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { ProcessColumnsService } from './processColumns.service';

@Controller('process-columns')  
export class ProcessColumnsController {
  constructor(private readonly processColumnsService: ProcessColumnsService) {}

  @Get('by-company/:empresaId')
  async listByCompany(@Param('empresaId', ParseIntPipe) empresaId: number): Promise<any> {
    return await this.processColumnsService.listByCompany(empresaId);
  }

  @Post('create')
  async create(@Body() body) {
    const { name, empresa_id, display_order, description } = body;
    return await this.processColumnsService.create(name, empresa_id, display_order, description);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body) {
    const { name } = body;
    return await this.processColumnsService.update(id, name);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.processColumnsService.delete(id);
  }
}
